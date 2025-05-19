import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import uploadToCloudinary from "@/hooks/cloudinary";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ImagePlus, X } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  image: z.string().optional(),
  imagePublicId: z.string().optional(),
  gallery: z.array(z.string()).default([]),
  galleryPublicIds: z.array(z.string()).optional(),
  specialties: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one specialty.",
  }),
  services: z.array(z.any()).default([]),
  location: z.object({
    address: z.string().min(5, {
      message: "Address must be at least 5 characters.",
    }),
    city: z.string().min(2, {
      message: "City must be at least 2 characters.",
    }),
    state: z.string().min(2, {
      message: "State must be at least 2 characters.",
    }),
    zipCode: z.string().min(5, {
      message: "Zip code must be at least 5 characters.",
    }),
  }),
  hours: z.object({
    monday: z.string().optional(),
    tuesday: z.string().optional(),
    wednesday: z.string().optional(),
    thursday: z.string().optional(),
    friday: z.string().optional(),
    saturday: z.string().optional(),
    sunday: z.string().optional(),
  }),
  phone: z.string().min(10, {
    message: "Please enter a valid phone number.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  website: z.string().url({
    message: "Please enter a valid website URL.",
  }).optional(),
  verified: z.boolean().default(false).optional(),
});

type ServiceProviderFormValues = z.infer<typeof formSchema>;

const timeFields = [
  { key: "monday" as const, label: "Monday" },
  { key: "tuesday" as const, label: "Tuesday" },
  { key: "wednesday" as const, label: "Wednesday" },
  { key: "thursday" as const, label: "Thursday" },
  { key: "friday" as const, label: "Friday" },
  { key: "saturday" as const, label: "Saturday" },
  { key: "sunday" as const, label: "Sunday" },
];

interface ImageFile {
  file?: File;
  preview: string;
  cloudinaryUrl?: string;
  publicId?: string;
}

interface ServiceProviderFormProps {
  initialData?: {
    _id?: string;
    name: string;
    description: string;
    image: string;
    imagePublicId?: string;
    gallery: string[];
    galleryPublicIds?: string[];
    specialties: string[];
    services: any[];
    location: {
      address: string;
      city: string;
      state: string;
      zipCode: string;
    };
    hours: {
      monday: string;
      tuesday: string;
      wednesday: string;
      thursday: string;
      friday: string;
      saturday: string;
      sunday: string;
    };
    phone: string;
    email: string;
    website: string;
    verified: boolean;
  };
  isEdit?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const defaultHours = {
  monday: "9:00 AM - 5:00 PM",
  tuesday: "9:00 AM - 5:00 PM",
  wednesday: "9:00 AM - 5:00 PM",
  thursday: "9:00 AM - 5:00 PM",
  friday: "9:00 AM - 5:00 PM",
  saturday: "Closed",
  sunday: "Closed"
};

const ServiceProviderForm = ({ initialData, isEdit = false, onSuccess, onCancel }: ServiceProviderFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [mainImage, setMainImage] = useState<ImageFile | null>(null);
  const [galleryImages, setGalleryImages] = useState<ImageFile[]>([]);
  const [removedPublicIds, setRemovedPublicIds] = useState<string[]>([]);

  const form = useForm<ServiceProviderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      image: "",
      imagePublicId: "",
      gallery: [],
      galleryPublicIds: [],
      specialties: [],
      services: [],
      location: {
        address: "",
        city: "",
        state: "",
        zipCode: "",
      },
      hours: defaultHours,
      phone: "",
      email: "",
      website: "",
      verified: false,
    },
    mode: "onChange",
  });

  // Initialize images from initialData if in edit mode
  useEffect(() => {
    if (isEdit && initialData) {
      if (initialData.image) {
        setMainImage({
          preview: initialData.image,
          cloudinaryUrl: initialData.image,
          publicId: initialData.imagePublicId
        });
      }
      if (initialData.gallery) {
        setGalleryImages(
          initialData.gallery.map((url, index) => ({
            preview: url,
            cloudinaryUrl: url,
            publicId: initialData.galleryPublicIds?.[index]
          }))
        );
      }
    }
  }, [isEdit, initialData]);

  // Handle local image preview
  const handleImageSelect = (file: File, isGallery: boolean = false) => {
    const preview = URL.createObjectURL(file);
    const imageFile: ImageFile = { file, preview };

    if (isGallery) {
      setGalleryImages(prev => [...prev, imageFile]);
    } else {
      setMainImage(imageFile);
    }
  };

  // Cleanup preview URLs when component unmounts
  useEffect(() => {
    return () => {
      if (mainImage?.preview && !mainImage.cloudinaryUrl) {
        URL.revokeObjectURL(mainImage.preview);
      }
      galleryImages.forEach(img => {
        if (img.preview && !img.cloudinaryUrl) {
          URL.revokeObjectURL(img.preview);
        }
      });
    };
  }, [mainImage, galleryImages]);

  // Handle image removal
  const removeImage = (index: number, isGallery: boolean = false) => {
    if (isGallery) {
      const imageToRemove = galleryImages[index];
      if (imageToRemove.preview && !imageToRemove.cloudinaryUrl) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      if (imageToRemove.publicId) {
        setRemovedPublicIds(prev => [...prev, imageToRemove.publicId!]);
      }
      setGalleryImages(prev => prev.filter((_, i) => i !== index));
    } else {
      if (mainImage?.preview && !mainImage.cloudinaryUrl) {
        URL.revokeObjectURL(mainImage.preview);
      }
      if (mainImage?.publicId) {
        setRemovedPublicIds(prev => [...prev, mainImage.publicId!]);
      }
      setMainImage(null);
      form.setValue("image", "");
    }
  };

  // Upload images to Cloudinary
  const uploadImages = async () => {
    setIsUploading(true);
    try {
      // Upload main image if it exists and hasn't been uploaded yet
      if (mainImage?.file) {
        const result = await uploadToCloudinary(mainImage.file);
        form.setValue("image", result.url);
        form.setValue("imagePublicId", result.publicId);
      } else if (mainImage?.cloudinaryUrl) {
        form.setValue("image", mainImage.cloudinaryUrl);
        form.setValue("imagePublicId", mainImage.publicId);
      }

      // Upload gallery images that haven't been uploaded yet
      const galleryData = await Promise.all(
        galleryImages.map(async (img) => {
          if (img.cloudinaryUrl) {
            return {
              url: img.cloudinaryUrl,
              publicId: img.publicId
            };
          }
          if (img.file) {
            const result = await uploadToCloudinary(img.file);
            return {
              url: result.url,
              publicId: result.publicId
            };
          }
          return null;
        })
      );

      const validGalleryData = galleryData.filter((data): data is { url: string; publicId: string } => data !== null);
      
      form.setValue("gallery", validGalleryData.map(data => data.url));
      form.setValue("galleryPublicIds", validGalleryData.map(data => data.publicId));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  async function onSubmit(values: ServiceProviderFormValues) {
    console.log('onSubmit input values:', JSON.stringify(values, null, 2));

    if (isEdit && initialData?._id) {
      // Edit mode: similar to handleUpdateProfile - merge initialData with form values
      
      // Handle image uploads first if there are new/changed images or removals
      if ((mainImage?.file || galleryImages.some(img => img.file)) || removedPublicIds.length > 0) {
        try {
          await uploadImages(); // This function updates form values for image/gallery URLs
        } catch (error) {
          // Error is already toasted in uploadImages function
          return; // Stop submission if image upload fails
        }
      }

      const dataToSubmit: any = {
        ...initialData, // Start with existing data
        ...values,      // Override with validated form values
        image: form.getValues("image"), // Ensure latest image URL from potential upload
        imagePublicId: form.getValues("imagePublicId"),
        gallery: form.getValues("gallery"), // Ensure latest gallery URLs
        galleryPublicIds: form.getValues("galleryPublicIds"),
        updatedAt: new Date().toISOString(), // Set/update the updatedAt timestamp
      };

      if (removedPublicIds.length > 0) {
        dataToSubmit.removedPublicIds = removedPublicIds;
      }
      
      // The _id is part of initialData and will be spread. 
      // It's usually fine in the body for a PUT, or the backend ignores it if it only uses the URL param.

      console.log('Data constructed for PUT (edit):', JSON.stringify(dataToSubmit, null, 2));

      try {
        const response = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/v1/service-providers/${initialData._id}`,
          dataToSubmit,
          { 
            headers: { 
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              'Content-Type': 'application/json',
            }
          }
        );
        toast({ title: "Success", description: "Service provider updated successfully." });
        if (response.data) {
          setRemovedPublicIds([]); // Reset removed public IDs on successful update
          if (onSuccess) {
            onSuccess();
          }
        }
      } catch (error: any) {
        console.error("Submission error (edit):", error);
        let errorMessage = "Failed to update service provider. Please try again.";
        if (error.response) {
          console.error("Server Response Data (raw):", error.response.data);
          try {
            console.error("Server Response Data (JSON):", JSON.stringify(error.response.data, null, 2));
          } catch (e) {
            console.error("Could not stringify error.response.data");
          }
          console.error("Server Response Status:", error.response.status);
          console.error("Server Response Headers:", error.response.headers);
          if (error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else if (error.response.statusText) {
            errorMessage = `Server error: ${error.response.statusText}`;
          }
        } else if (error.request) {
          console.error("Error Request:", error.request);
          errorMessage = "No response from server. Please check your network connection.";
        } else {
          console.error("Error Message:", error.message);
          errorMessage = error.message || errorMessage;
        }
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } else {
      // Create mode: send all data, including images
      // Perform image uploads first if there are new images or removals
      if ((mainImage?.file || galleryImages.some(img => img.file)) || removedPublicIds.length > 0) {
        try {
          await uploadImages(); // This function updates form values for image/gallery URLs
        } catch (error) {
          // Error is already toasted in uploadImages function
          return; // Stop submission if image upload fails
        }
      }

      // Prepare the data for submission AFTER potential image uploads
      const dataToSubmit: any = {
        ...values, // Zod validated form values
        image: form.getValues("image"), // Get potentially updated URL
        imagePublicId: form.getValues("imagePublicId"),
        gallery: form.getValues("gallery"),
        galleryPublicIds: form.getValues("galleryPublicIds"),
        updatedAt: new Date().toISOString(),
      };

      if (removedPublicIds.length > 0) {
        dataToSubmit.removedPublicIds = removedPublicIds;
      }

      console.log('Data constructed for POST:', JSON.stringify(dataToSubmit, null, 2));

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/v1/service-providers`,
          dataToSubmit,
          { 
            headers: { 
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              'Content-Type': 'application/json',
            } 
          }
        );
        toast({ title: "Success", description: "Service provider created successfully." });
        if (response.data) {
          setRemovedPublicIds([]); // Reset removed public IDs on successful creation
          if (onSuccess) {
            onSuccess();
          }
        }
      } catch (error: any) {
        console.error("Submission error (create):", error);
        let errorMessage = "Failed to create service provider. Please try again.";
        if (error.response) {
          console.error("Server Response Data (raw):", error.response.data);
          try {
            console.error("Server Response Data (JSON):", JSON.stringify(error.response.data, null, 2));
          } catch (e) {
            console.error("Could not stringify error.response.data");
          }
          console.error("Server Response Status:", error.response.status);
          console.error("Server Response Headers:", error.response.headers);
          if (error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else if (error.response.statusText) {
            errorMessage = `Server error: ${error.response.statusText}`;
          }
        } else if (error.request) {
          console.error("Error Request:", error.request);
          errorMessage = "No response from server. Please check your network connection.";
      } else {
          console.error("Error Message:", error.message);
          errorMessage = error.message || errorMessage;
        }
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Basic Information</h3>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Service Provider Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us about your service"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Main Image Upload */}
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Main Image</FormLabel>
                <FormControl>
                  <div className="flex flex-col gap-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageSelect(file);
                      }}
                      disabled={isUploading}
                    />
                    {mainImage && (
                      <div className="relative w-40 h-40">
                        <img
                          src={mainImage.preview}
                          alt="Main preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2"
                          onClick={() => removeImage(0)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Gallery Images Upload */}
          <FormField
            control={form.control}
            name="gallery"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gallery Images</FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageSelect(file, true);
                      }}
                      disabled={isUploading}
                    />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {galleryImages.map((img, index) => (
                        <div key={index} className="relative w-40 h-40">
                          <img
                            src={img.preview}
                            alt={`Gallery ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2"
                            onClick={() => removeImage(index, true)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Contact Information</h3>
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="Phone Number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Website URL" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Specialties */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Specialties</h3>
          <FormField
            control={form.control}
            name="specialties"
            render={() => (
              <FormItem>
                <FormLabel>Select Specialties</FormLabel>
                <div className="flex flex-wrap gap-2">
                  <FormField
                    control={form.control}
                    name="specialties"
                    render={({ field }) => {
                      const handleCheckboxChange = (value: string) => {
                        if (field.value?.includes(value)) {
                          field.onChange(field.value.filter((v: string) => v !== value));
                        } else {
                          field.onChange([...(field.value || []), value]);
                        }
                      };

                      return (
                        <>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="mechanic"
                              checked={field.value?.includes("mechanic")}
                              onCheckedChange={() => handleCheckboxChange("mechanic")}
                            />
                            <Label htmlFor="mechanic">Mechanic</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="bodyShop"
                              checked={field.value?.includes("bodyShop")}
                              onCheckedChange={() => handleCheckboxChange("bodyShop")}
                            />
                            <Label htmlFor="bodyShop">Body Shop</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="inspectionService"
                              checked={field.value?.includes("inspectionService")}
                              onCheckedChange={() => handleCheckboxChange("inspectionService")}
                            />
                            <Label htmlFor="inspectionService">Inspection Service</Label>
                          </div>
                        </>
                      );
                    }}
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Location Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Location Information</h3>
          <FormField
            control={form.control}
            name="location.address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="Address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="location.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="City" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location.state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input placeholder="State" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location.zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zip Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Zip Code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Business Hours Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Business Hours</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {timeFields.map((field) => (
              <div key={field.key} className="flex flex-col space-y-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                <FormField
                  control={form.control}
                  name={`hours.${field.key}`}
                  render={({ field: formField }) => (
                    <FormItem>
                      <FormControl>
                <Input
                  id={field.key}
                  placeholder={`e.g. 9:00 AM - 5:00 PM or "Closed"`}
                          {...formField}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </div>
        </div>

        <Button type="submit" disabled={isUploading}>
          {isUploading ? "Uploading..." : isEdit ? "Update" : "Submit"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="ml-2">
            Cancel
          </Button>
        )}
      </form>
    </Form>
  );
};

export default ServiceProviderForm;


import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { Loader2, Upload, X, Plus, Trash } from "lucide-react";

const serviceProviderSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  specialties: z.array(z.string()).min(1, "Please add at least one specialty"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email"),
  website: z.string().optional(),
  address: z.object({
    address: z.string().min(5, "Address must be at least 5 characters"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    zipCode: z.string().min(5, "Valid Zip code is required"),
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
});

type ServiceProviderFormValues = z.infer<typeof serviceProviderSchema>;

interface ServiceProviderFormProps {
  serviceProviderId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ServiceProviderForm: React.FC<ServiceProviderFormProps> = ({
  serviceProviderId,
  onSuccess,
  onCancel,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [specialty, setSpecialty] = useState("");
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  const form = useForm<ServiceProviderFormValues>({
    resolver: zodResolver(serviceProviderSchema),
    defaultValues: {
      name: "",
      description: "",
      specialties: [],
      phone: "",
      email: "",
      website: "",
      address: {
        address: "",
        city: "",
        state: "",
        zipCode: ""
      },
      hours: {
        monday: "8:00 AM - 5:00 PM",
        tuesday: "8:00 AM - 5:00 PM",
        wednesday: "8:00 AM - 5:00 PM",
        thursday: "8:00 AM - 5:00 PM",
        friday: "8:00 AM - 5:00 PM",
        saturday: "Closed",
        sunday: "Closed"
      }
    },
  });

  // If editing, load existing data
  useEffect(() => {
    if (serviceProviderId) {
      setIsLoading(true);
      const fetchServiceProvider = async () => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/service-providers/${serviceProviderId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          if (response.data.success) {
            const provider = response.data.data;
            
            form.reset({
              name: provider.name,
              description: provider.description,
              specialties: provider.specialties || [],
              phone: provider.phone,
              email: provider.email,
              website: provider.website || "",
              address: {
                address: provider.location?.address || "",
                city: provider.location?.city || "",
                state: provider.location?.state || "",
                zipCode: provider.location?.zipCode || ""
              },
              hours: {
                monday: provider.hours?.monday || "8:00 AM - 5:00 PM",
                tuesday: provider.hours?.tuesday || "8:00 AM - 5:00 PM",
                wednesday: provider.hours?.wednesday || "8:00 AM - 5:00 PM",
                thursday: provider.hours?.thursday || "8:00 AM - 5:00 PM",
                friday: provider.hours?.friday || "8:00 AM - 5:00 PM",
                saturday: provider.hours?.saturday || "Closed",
                sunday: provider.hours?.sunday || "Closed",
              }
            });

            // Set image preview if available
            if (provider.image) {
              setImagePreview(provider.image);
            }

            // Set gallery previews if available
            if (provider.gallery && provider.gallery.length > 0) {
              setGalleryPreviews(provider.gallery);
            }
          }
        } catch (error) {
          console.error("Error fetching service provider:", error);
          toast({
            title: "Error",
            description: "Failed to load service provider data",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchServiceProvider();
    }
  }, [serviceProviderId, form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      
      const newFiles = [...galleryFiles, ...filesArray];
      setGalleryFiles(newFiles);
      
      const newPreviews = [...galleryPreviews];
      filesArray.forEach(file => {
        newPreviews.push(URL.createObjectURL(file));
      });
      setGalleryPreviews(newPreviews);
    }
  };

  const removeGalleryImage = (index: number) => {
    const newFiles = [...galleryFiles];
    newFiles.splice(index, 0); // Remove files that were added in this session
    setGalleryFiles(newFiles);
    
    const newPreviews = [...galleryPreviews];
    newPreviews.splice(index, 1);
    setGalleryPreviews(newPreviews);
  };

  const addSpecialty = () => {
    if (!specialty.trim()) return;
    
    const currentSpecialties = form.getValues().specialties || [];
    if (currentSpecialties.includes(specialty.trim())) {
      toast({
        title: "Duplicate Specialty",
        description: "This specialty is already in your list",
        variant: "destructive",
      });
      return;
    }
    
    form.setValue("specialties", [...currentSpecialties, specialty.trim()]);
    setSpecialty("");
  };

  const removeSpecialty = (index: number) => {
    const currentSpecialties = form.getValues().specialties;
    const updated = [...currentSpecialties];
    updated.splice(index, 1);
    form.setValue("specialties", updated);
  };

  const onSubmit = async (data: ServiceProviderFormValues) => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication Required",
        description: "Please login to register as a service provider",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for file uploads
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("specialties", JSON.stringify(data.specialties));
      formData.append("phone", data.phone);
      formData.append("email", data.email);
      if (data.website) formData.append("website", data.website);
      formData.append("location", JSON.stringify(data.address));
      formData.append("hours", JSON.stringify(data.hours));
      
      // Add image if selected
      if (image) {
        formData.append("images", image);
      }
      
      // Add gallery images if selected
      galleryFiles.forEach(file => {
        formData.append("gallery", file);
      });

      const url = serviceProviderId
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/service-providers/${serviceProviderId}`
        : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/service-providers`;

      const method = serviceProviderId ? "put" : "post";

      const response = await axios({
        method,
        url,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.success) {
        toast({
          title: serviceProviderId ? "Updated Successfully" : "Registration Successful",
          description: serviceProviderId 
            ? "Your service provider profile has been updated"
            : "You have successfully registered as a service provider",
        });
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "Failed to submit service provider registration",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
        <p className="ml-2">Loading...</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium mb-4">Basic Information</h3>
          </div>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Name*</FormLabel>
                <FormControl>
                  <Input placeholder="Your business name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <label className="block text-sm font-medium mb-1">Logo Image</label>
            <div className="flex items-center gap-4">
              {imagePreview && (
                <div className="relative h-16 w-16 rounded-md overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Logo preview"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-0 right-0 p-1 bg-red-500 rounded-bl-md text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              <div>
                <div className="flex items-center">
                  <label className="cursor-pointer border rounded-md px-4 py-2 hover:bg-gray-50">
                    <Upload className="h-4 w-4 mr-2 inline-block" />
                    {imagePreview ? "Change Logo" : "Upload Logo"}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: Square image, at least 300x300px
                </p>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Description*</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your services, expertise, and what makes your business unique"
                      className="h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Specialties*</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.getValues().specialties?.map((item, index) => (
                <div key={index} className="bg-primary/10 rounded-full px-3 py-1 flex items-center text-sm gap-1">
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => removeSpecialty(index)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="Add a specialty (e.g., Oil Change, Brake Repair)"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSpecialty();
                  }
                }}
              />
              <Button type="button" onClick={addSpecialty}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
            {form.formState.errors.specialties && (
              <p className="text-sm font-medium text-destructive mt-1">
                {form.formState.errors.specialties.message}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <h3 className="text-lg font-medium mb-4 mt-4">Contact Information</h3>
          </div>

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number*</FormLabel>
                <FormControl>
                  <Input placeholder="+91 XXXXXXXXXX" {...field} />
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
                <FormLabel>Email Address*</FormLabel>
                <FormControl>
                  <Input placeholder="contact@yourbusiness.com" {...field} />
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
                  <Input placeholder="https://yourbusiness.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="md:col-span-2">
            <h3 className="text-lg font-medium mb-4 mt-4">Address</h3>
          </div>

          <FormField
            control={form.control}
            name="address.address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street Address*</FormLabel>
                <FormControl>
                  <Input placeholder="123 Main St" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="address.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City*</FormLabel>
                  <FormControl>
                    <Input placeholder="Mumbai" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address.state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State*</FormLabel>
                  <FormControl>
                    <Input placeholder="Maharashtra" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="address.zipCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Zip Code*</FormLabel>
                <FormControl>
                  <Input placeholder="400001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="md:col-span-2">
            <h3 className="text-lg font-medium mb-4 mt-4">Business Hours</h3>
          </div>

          {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
            <FormField
              key={day}
              control={form.control}
              name={`hours.${day}` as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{day.charAt(0).toUpperCase() + day.slice(1)}</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select hours" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="8:00 AM - 5:00 PM">8:00 AM - 5:00 PM</SelectItem>
                      <SelectItem value="9:00 AM - 6:00 PM">9:00 AM - 6:00 PM</SelectItem>
                      <SelectItem value="10:00 AM - 7:00 PM">10:00 AM - 7:00 PM</SelectItem>
                      <SelectItem value="24 Hours">24 Hours</SelectItem>
                      <SelectItem value="By Appointment">By Appointment</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          ))}

          <div className="md:col-span-2">
            <h3 className="text-lg font-medium mb-4 mt-4">Gallery Photos</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
              {galleryPreviews.map((preview, index) => (
                <div key={index} className="relative h-24 bg-gray-100 rounded-md overflow-hidden">
                  <img
                    src={preview}
                    alt={`Gallery ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white"
                  >
                    <Trash className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <label className="h-24 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center cursor-pointer hover:bg-gray-50">
                <div className="text-center">
                  <Plus className="h-8 w-8 text-gray-400 mx-auto" />
                  <span className="text-sm text-gray-500">Add Photos</span>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryChange}
                />
              </label>
            </div>
            <p className="text-xs text-gray-500">
              Upload photos of your facility, equipment, completed work, etc.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {serviceProviderId ? "Update Provider" : "Register as Provider"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ServiceProviderForm;

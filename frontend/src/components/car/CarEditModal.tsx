import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Trash, Upload, Info } from "lucide-react";
import axios from "axios";

interface CarImage {
  url: string;
  publicId: string;
}

interface Document {
  url?: string;
  publicId?: string;
  file?: File;
}

interface Seller {
  _id: string;
  name: string;
}

interface CarListing {
  id?: string;
  title: string;
  make: string;
  model: string;
  year: string;
  price: string;
  mileage: string;
  condition: string;
  location: string;
  description: string;
  images: CarImage[];
  features?: string[];
  exteriorColor?: string;
  interiorColor?: string;
  fuelType?: string;
  transmission?: string;
  totalDriven?: string;
  _id?: string;
  bodyType?: string;
  seller: Seller;
  rcDocument?: Document;
  insuranceDocument?: Document;
  pucDocument?: Document;
}

interface CarEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: CarListing | null;
  onUpdate: () => void;
}

const features = [
  "Bluetooth", "Backup Camera", "Navigation", "Heated Seats", 
  "Sunroof", "Leather Seats", "Apple CarPlay", "Android Auto",
  "Blind Spot Monitor", "Lane Departure Warning", "Cruise Control",
  "Remote Start", "Keyless Entry", "Premium Audio", "Third Row Seating"
];

const CarEditModal: React.FC<CarEditModalProps> = ({
  isOpen,
  onClose,
  listing,
  onUpdate,
}) => {
  const [formData, setFormData] = useState<Partial<CarListing>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newImages, setNewImages] = useState<File[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (listing) {
      setFormData({
        ...listing,
        location: listing.location || ""
      });
    }
  }, [listing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string | Document | null) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewImages((prev) => [...prev, ...files]);
    }
  };

  const handleImageDelete = async (publicId: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete('http://localhost:5000/api/v1/delete-image', {
        data: { public_id: formData.images.find(img => img.publicId === publicId)?.publicId },
        headers: {  Authorization: `Bearer ${token}` }
      });
      // Update local state to remove the deleted image
      setFormData((prev) => ({
        ...prev,
        images: prev.images?.filter((img) => img.publicId !== publicId) || [],
      }));

      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting image:", error);
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
    }
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => {
      const currentFeatures = prev.features || [];
      const newFeatures = currentFeatures.includes(feature)
        ? currentFeatures.filter(f => f !== feature)
        : [...currentFeatures, feature];
      return { ...prev, features: newFeatures };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listing?.id) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");

      // Upload new images first if any
      let uploadedImages: CarImage[] = [];
      if (newImages.length > 0) {
        const imageUploads = newImages.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('upload_preset', 'auto_trust');

          const response = await axios.post(
            'https://api.cloudinary.com/v1_1/dquspyuhw/upload',
            formData
          );

          return {
            url: response.data.secure_url,
            publicId: response.data.public_id,
          };
        });

        uploadedImages = await Promise.all(imageUploads);
      }

      // Upload documents if changed
      let uploadedDocuments: { [key: string]: { url: string; publicId: string } } = {};
      
      const documentUploads = [
        { field: 'rcDocument', file: formData.rcDocument?.file },
        { field: 'insuranceDocument', file: formData.insuranceDocument?.file },
        { field: 'pucDocument', file: formData.pucDocument?.file }
      ].filter(doc => doc.file instanceof File);

      if (documentUploads.length > 0) {
        const documentResults = await Promise.all(
          documentUploads.map(async ({ field, file }) => {
            const formData = new FormData();
            formData.append('file', file as File);
            formData.append('upload_preset', 'auto_trust');

            const response = await axios.post(
              'https://api.cloudinary.com/v1_1/dquspyuhw/upload',
              formData
            );

            return {
              field,
              url: response.data.secure_url,
              publicId: response.data.public_id,
            };
          })
        );

        documentResults.forEach(({ field, url, publicId }) => {
          uploadedDocuments[field] = { url, publicId };
        });
      }

      // Update the listing with both existing and new images, and documents
      const updatedData = {
        ...formData,
        images: [...(formData.images || []), ...uploadedImages],
        ...(uploadedDocuments.rcDocument && { rcDocument: uploadedDocuments.rcDocument }),
        ...(uploadedDocuments.insuranceDocument && { insuranceDocument: uploadedDocuments.insuranceDocument }),
        ...(uploadedDocuments.pucDocument && { pucDocument: uploadedDocuments.pucDocument }),
        // Keep the original seller ID
        seller: listing.seller._id,
        // Remove temporary contact fields
        contactName: undefined,
        contactEmail: undefined,
        contactPhone: undefined,
      };

      await axios.put(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/cars/${listing.id}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: "Success",
        description: "Car listing updated successfully",
      });

      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating listing:", error);
      toast({
        title: "Error",
        description: "Failed to update listing",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Car Listing</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Make*</label>
              <Select
                value={formData.make}
                onValueChange={(value) => handleSelectChange("make", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select make" />
                </SelectTrigger>
                <SelectContent>
                  {["Toyota", "Honda", "Ford", "Chevrolet", "BMW", "Mercedes-Benz", "Audi", "Nissan", "Hyundai", "Kia"].map((make) => (
                    <SelectItem key={make} value={make}>{make}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Model*</label>
              <Input
                name="model"
                value={formData.model || ""}
                onChange={handleChange}
                placeholder="e.g. Camry"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Year*</label>
              <Input
                name="year"
                value={formData.year || ""}
                onChange={handleChange}
                placeholder="e.g. 2021"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Price (₹)*</label>
              <Input
                name="price"
                value={formData.price || ""}
                onChange={handleChange}
                placeholder="e.g. 25000"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Mileage (kmpl)*</label>
              <Input
                name="mileage"
                value={formData.mileage || ""}
                onChange={handleChange}
                placeholder="e.g. 15"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Total Driven (km)</label>
              <Input
                name="totalDriven"
                value={formData.totalDriven || ""}
                onChange={handleChange}
                placeholder="e.g. 15000"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Exterior Color</label>
              <Input
                name="exteriorColor"
                value={formData.exteriorColor || ""}
                onChange={handleChange}
                placeholder="e.g. Black"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Interior Color</label>
              <Input
                name="interiorColor"
                value={formData.interiorColor || ""}
                onChange={handleChange}
                placeholder="e.g. Beige"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Fuel Type</label>
              <Select
                value={formData.fuelType}
                onValueChange={(value) => handleSelectChange("fuelType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fuel type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Gasoline">Gasoline</SelectItem>
                  <SelectItem value="Diesel">Diesel</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                  <SelectItem value="Electric">Electric</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Transmission</label>
              <Select
                value={formData.transmission}
                onValueChange={(value) => handleSelectChange("transmission", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select transmission" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Automatic">Automatic</SelectItem>
                  <SelectItem value="Manual">Manual</SelectItem>
                  <SelectItem value="CVT">CVT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Body Type</label>
              <Select
                value={formData.bodyType}
                onValueChange={(value) => handleSelectChange("bodyType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select body type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sedan">Sedan</SelectItem>
                  <SelectItem value="SUV">SUV</SelectItem>
                  <SelectItem value="Truck">Truck</SelectItem>
                  <SelectItem value="Coupe">Coupe</SelectItem>
                  <SelectItem value="Hatchback">Hatchback</SelectItem>
                  <SelectItem value="Convertible">Convertible</SelectItem>
                  <SelectItem value="Wagon">Wagon</SelectItem>
                  <SelectItem value="Van">Van</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Condition</label>
              <Select
                value={formData.condition}
                onValueChange={(value) => handleSelectChange("condition", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Excellent">Excellent</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Fair">Fair</SelectItem>
                  <SelectItem value="Poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Location*</label>
            <Input
              name="location"
              value={formData.location || ""}
              onChange={handleChange}
              placeholder="e.g. Mumbai, Maharashtra"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              placeholder="Describe your vehicle..."
              rows={4}
            />
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium">Features</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {features.map((feature) => (
                <div 
                  key={feature}
                  onClick={() => handleFeatureToggle(feature)}
                  className={`px-3 py-2 rounded-md cursor-pointer border text-sm ${
                    formData.features?.includes(feature) 
                      ? 'bg-primary/10 border-primary text-primary' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    {formData.features?.includes(feature) && (
                      <svg className="h-4 w-4 mr-1.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {feature}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500">Select all features that apply to your vehicle.</p>
          </div>

          {/* <div className="space-y-6">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Name*</label>
                <Input
                  name="contactName"
                  value={formData.contactName || ""}
                  onChange={handleChange}
                  placeholder="Full name"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number*</label>
                <Input
                  name="contactPhone"
                  value={formData.contactPhone || ""}
                  onChange={handleChange}
                  placeholder="e.g. (123) 456-7890"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address*</label>
                <Input
                  name="contactEmail"
                  value={formData.contactEmail || ""}
                  type="email"
                  placeholder="e.g. your.email@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Location*</label>
                <Input
                  name="location"
                  value={formData.location || ""}
                  onChange={handleChange}
                  placeholder="e.g. Mumbai, Maharashtra"
                />
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <Info className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800 mb-1">Privacy Note</h4>
                  <p className="text-sm text-blue-700">
                    Your contact information will be visible to potential buyers. We recommend using a phone number you're comfortable sharing.
                  </p>
                </div>
              </div>
            </div>
          </div> */}

          <div>
            <label className="text-sm font-medium block mb-2">Images</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {formData.images?.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image.url}
                    alt={`Car ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleImageDelete(image.publicId)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {newImages.map((file, index) => (
                <div key={`new-${index}`} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`New upload ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              ))}
              <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400">
                <Upload className="h-6 w-6 text-gray-400" />
                <span className="mt-2 text-sm text-gray-500">Add Image</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Documents</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">RC Document</span>
                  {formData.rcDocument && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleSelectChange("rcDocument", null)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-4 hover:border-gray-400 cursor-pointer">
                  <Upload className="h-6 w-6 text-gray-400 mb-1" />
                  <span className="text-sm text-gray-500">Upload RC</span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => e.target.files && handleSelectChange("rcDocument", { file: e.target.files[0] })}
                  />
                </label>
              </div>

              <div className="border rounded-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Insurance</span>
                  {formData.insuranceDocument && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleSelectChange("insuranceDocument", null)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-4 hover:border-gray-400 cursor-pointer">
                  <Upload className="h-6 w-6 text-gray-400 mb-1" />
                  <span className="text-sm text-gray-500">Upload Insurance</span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => e.target.files && handleSelectChange("insuranceDocument", { file: e.target.files[0] })}
                  />
                </label>
              </div>

              <div className="border rounded-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">PUC Certificate</span>
                  {formData.pucDocument && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleSelectChange("pucDocument", null)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-4 hover:border-gray-400 cursor-pointer">
                  <Upload className="h-6 w-6 text-gray-400 mb-1" />
                  <span className="text-sm text-gray-500">Upload PUC</span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => e.target.files && handleSelectChange("pucDocument", { file: e.target.files[0] })}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Listing"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CarEditModal; 
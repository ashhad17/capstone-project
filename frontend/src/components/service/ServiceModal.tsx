import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import axios from "axios";
import uploadToCloudinary from "@/hooks/cloudinary";
import { X } from "lucide-react";

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  service?: any; // Pass service data for editing
  serviceProviderId: string;
}

const ServiceModal: React.FC<ServiceModalProps> = ({ isOpen, onClose, onSave, service, serviceProviderId }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "maintenance",
    duration: "",
    image: {
      url: null,
      publicId: null
    }
  });
  const [isUploading, setIsUploading] = useState(false);

  // Reset formData when the modal is opened
  useEffect(() => {
    if (service) {
      // Populate formData with service data for editing
      setFormData({
        name: service.name || "",
        description: service.description || "",
        price: service.price || "",
        category: service.category || "maintenance",
        duration: service.duration || "",
        image: service.image || { url: null, publicId: null }
      });
    } else {
      // Reset formData for adding a new service
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "maintenance",
        duration: "",
        image: { url: null, publicId: null }
      });
    }
  }, [service, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const result = await uploadToCloudinary(file);
      setFormData(prev => ({
        ...prev,
        image: {
          url: result.url,
          publicId: result.publicId
        }
      }));
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageDelete = async () => {
    if (!formData.image.publicId) return;
    console.log("Deleting image with public ID:", formData.image.publicId);
    try {
      // Delete from Cloudinary
      await axios.delete('http://localhost:5000/api/v1/delete-image', {
        data: { public_id: formData.image.publicId }
      });

      // Update form data
      setFormData(prev => ({
        ...prev,
        image: { url: null, publicId: null }
      }));
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (service) {
        // Edit service
        await axios.put(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/v1/services/${service._id}`,
          { 
            ...formData, 
            serviceProvider: serviceProviderId
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Add new service
        await axios.post(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/v1/services`,
          { 
            ...formData, 
            serviceProvider: serviceProviderId
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      onSave(); // Refresh the services list
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error saving service:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={service ? "Edit Service" : "Add Service"}>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Service Name</label>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter service name"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter service description"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Price</label>
          <Input
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            placeholder="Enter service price"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Duration</label>
          <Input
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            placeholder="Enter service duration (e.g., 1-2 hours)"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Category</label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="repair">Repair</SelectItem>
              <SelectItem value="cleaning">Cleaning</SelectItem>
              <SelectItem value="inspection">Inspection</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Service Image</label>
          <div className="mt-2">
            {formData.image.url ? (
              <div className="relative inline-block">
                <img
                  src={formData.image.url}
                  alt="Service"
                  className="h-32 w-32 object-cover rounded-lg"
                />
                <button
                  onClick={handleImageDelete}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG or JPEG</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isUploading}>
          {service ? "Save Changes" : "Add Service"}
        </Button>
      </div>
    </Modal>
  );
};

export default ServiceModal;
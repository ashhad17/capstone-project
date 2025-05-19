import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface ServiceFormProps {
  initialData?: {
    _id?: string;
    name: string;
    price: number;
    duration: number;
    description: string;
    category: string;
    status?: "active" | "inactive";
  };
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isEdit?: boolean;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ 
  initialData, 
  onSubmit, 
  onCancel,
  isEdit = false 
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    price: initialData?.price || 0,
    duration: initialData?.duration || 30,
    description: initialData?.description || "",
    category: initialData?.category || "maintenance",
    status: initialData?.status || "active"
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "price" || name === "duration" ? Number(value) : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate form data
      if (!formData.name || !formData.description || !formData.category) {
        throw new Error("Please fill in all required fields");
      }

      if (formData.price <= 0) {
        throw new Error("Price must be greater than 0");
      }

      if (formData.duration <= 0) {
        throw new Error("Duration must be greater than 0");
      }

      // Submit the form
      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit form",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Name *</label>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Service name"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Price *</label>
          <Input
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            placeholder="0.00"
            min="0"
            step="0.01"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Duration (minutes) *</label>
          <Input
            name="duration"
            type="number"
            value={formData.duration}
            onChange={handleChange}
            placeholder="30"
            min="1"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Category *</label>
          <Select 
            value={formData.category} 
            onValueChange={(value) => handleSelectChange("category", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="repair">Repair</SelectItem>
              <SelectItem value="inspection">Inspection</SelectItem>
              <SelectItem value="detailing">Detailing</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-medium">Description *</label>
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the service..."
            rows={3}
            required
          />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : (isEdit ? 'Update Service' : 'Save Service')}
        </Button>
      </div>
    </form>
  );
};

export default ServiceForm;

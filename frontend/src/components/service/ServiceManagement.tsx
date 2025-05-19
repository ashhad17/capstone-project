
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ServiceForm from "./ServiceForm";
import ServiceList from "./service-item/ServiceList";
import axios from "axios";

interface Service {
  _id: string;
  name: string;
  price: number;
  duration: number;
  description: string;
  category: string;
  status: "active" | "inactive";
  serviceProvider: {
    _id: string;
    name: string;
  };
}

const ServiceManagement: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editService, setEditService] = useState<Service | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No auth token found');
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/services/provider`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setServices(response.data.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch services",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      toast({
        title: "Error",
        description: "Failed to fetch services. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddService = async (newService: Omit<Service, '_id' | 'serviceProvider'>) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No auth token found');
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/services`,
        newService,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setServices([...services, response.data.data]);
        setIsAddDialogOpen(false);
        toast({
          title: "Success",
          description: "Service added successfully",
        });
      }
    } catch (error) {
      console.error("Error adding service:", error);
      toast({
        title: "Error",
        description: "Failed to add service. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleEditService = async (updatedService: Service) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No auth token found');
      }

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/services/${updatedService._id}`,
        updatedService,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setServices(services.map(service => 
          service._id === updatedService._id ? response.data.data : service
        ));
        setEditService(null);
        toast({
          title: "Success",
          description: "Service updated successfully",
        });
      }
    } catch (error) {
      console.error("Error updating service:", error);
      toast({
        title: "Error",
        description: "Failed to update service. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteService = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No auth token found');
      }

      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/services/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setServices(services.filter(service => service._id !== id));
        toast({
          title: "Success",
          description: "Service deleted successfully",
        });
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      toast({
        title: "Error",
        description: "Failed to delete service. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: "active" | "inactive") => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No auth token found');
      }

      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/services/${id}/status`,
        { status: currentStatus === "active" ? "inactive" : "active" },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setServices(services.map(service => 
          service._id === id 
            ? { ...service, status: currentStatus === "active" ? "inactive" : "active" } 
            : service
        ));
        toast({
          title: "Success",
          description: `Service ${currentStatus === "active" ? "deactivated" : "activated"} successfully`,
        });
      }
    } catch (error) {
      console.error("Error toggling service status:", error);
      toast({
        title: "Error",
        description: "Failed to update service status. Please try again later.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Service Management</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Service</DialogTitle>
              <DialogDescription>
                Create a new service offering for your customers.
              </DialogDescription>
            </DialogHeader>
            <ServiceForm onSubmit={handleAddService} onCancel={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={!!editService} onOpenChange={(open) => !open && setEditService(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>
              Update your service details.
            </DialogDescription>
          </DialogHeader>
          {editService && (
            <ServiceForm 
              initialData={editService} 
              onSubmit={handleEditService} 
              onCancel={() => setEditService(null)} 
              isEdit={true} 
            />
          )}
        </DialogContent>
      </Dialog>

      <ServiceList 
        services={services}
        onEdit={setEditService}
        onDelete={handleDeleteService}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
};

export default ServiceManagement;

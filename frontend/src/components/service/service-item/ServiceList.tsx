
import React from "react";
import { AlertDialog } from "@/components/ui/alert-dialog";
import ServiceItem from "./ServiceItem";
import ServiceDeleteDialog from "./ServiceDeleteDialog";

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

interface ServiceListProps {
  services: Service[];
  onEdit: (service: Service) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, status: "active" | "inactive") => void;
}

const ServiceList: React.FC<ServiceListProps> = ({
  services,
  onEdit,
  onDelete,
  onToggleStatus
}) => {
  const [serviceToDelete, setServiceToDelete] = React.useState<Service | null>(null);

  const handleDeleteIntent = (service: Service) => {
    setServiceToDelete(service);
  };

  const handleDelete = () => {
    if (serviceToDelete) {
      onDelete(serviceToDelete._id);
      setServiceToDelete(null);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      {services.map((service) => (
        <AlertDialog key={service._id} open={serviceToDelete?._id === service._id} onOpenChange={(open) => !open && setServiceToDelete(null)}>
          <ServiceItem
            service={service}
            onEdit={onEdit}
            onDelete={() => handleDeleteIntent(service)}
            onToggleStatus={onToggleStatus}
          />
          {serviceToDelete?._id === service._id && (
            <ServiceDeleteDialog 
              serviceName={serviceToDelete.name} 
              onDelete={handleDelete} 
            />
          )}
        </AlertDialog>
      ))}
      
      {services.length === 0 && (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium mb-2">No services found</h3>
          <p className="text-gray-600">
            Add your first service by clicking the "Add Service" button above
          </p>
        </div>
      )}
    </div>
  );
};

export default ServiceList;

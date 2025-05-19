
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";

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

interface ServiceItemProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, status: "active" | "inactive") => void;
}

const ServiceItem: React.FC<ServiceItemProps> = ({ service, onEdit, onDelete, onToggleStatus }) => {
  return (
    <Card key={service._id} className={service.status === "inactive" ? "opacity-70" : ""}>
      <CardHeader className="bg-gray-50">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{service.name}</CardTitle>
            <CardDescription>{service.category.charAt(0).toUpperCase() + service.category.slice(1)}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEdit(service)}
            >
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive border-destructive">
                  <Trash className="h-4 w-4 mr-1" /> Delete
                </Button>
              </AlertDialogTrigger>
              {/* AlertDialog content will be provided by the parent component */}
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Price</p>
            <p className="font-medium">₹{service.price}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Duration</p>
            <p className="font-medium">
              {service.duration < 60 
                ? `${service.duration} minutes` 
                : `${Math.floor(service.duration / 60)} hour${service.duration >= 120 ? 's' : ''} ${service.duration % 60 > 0 ? `${service.duration % 60} minutes` : ''}`
              }
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <div className="flex items-center">
              <span 
                className={`inline-block w-2 h-2 rounded-full mr-2 ${service.status === "active" ? "bg-green-500" : "bg-gray-400"}`}
              ></span>
              <span>{service.status === "active" ? "Active" : "Inactive"}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-2 text-xs h-6"
                onClick={() => onToggleStatus(service._id, service.status)}
              >
                {service.status === "active" ? "Deactivate" : "Activate"}
              </Button>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-700">{service.description}</p>
      </CardContent>
    </Card>
  );
};

export default ServiceItem;

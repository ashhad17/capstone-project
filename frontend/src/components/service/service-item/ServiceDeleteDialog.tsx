
import React from "react";
import {
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from "@/components/ui/alert-dialog";

interface ServiceDeleteDialogProps {
  serviceName: string;
  onDelete: () => void;
}

const ServiceDeleteDialog: React.FC<ServiceDeleteDialogProps> = ({ serviceName, onDelete }) => {
  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
        <AlertDialogDescription>
          This will permanently delete the service "{serviceName}". This action cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction 
          onClick={onDelete}
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        >
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
};

export default ServiceDeleteDialog;

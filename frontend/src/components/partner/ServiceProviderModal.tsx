
import React from "react";
import Modal from "@/components/ui/modal";
import ServiceProviderForm from "./ServiceProviderForm";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface ServiceProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceProviderId?: string;
}

const ServiceProviderModal: React.FC<ServiceProviderModalProps> = ({
  isOpen,
  onClose,
  serviceProviderId,
}) => {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const handleSuccess = () => {
    toast({
      title: serviceProviderId ? "Updated Successfully" : "Registration Successful",
      description: serviceProviderId
        ? "Your service provider profile has been updated"
        : "You have successfully registered as a service provider. Your application will be reviewed by our team.",
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={serviceProviderId ? "Edit Service Provider" : "Register as Service Provider"}
      size="xl"
    >
      <div className="p-4">
        {!isAuthenticated ? (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium mb-2">Authentication Required</h3>
            <p className="text-gray-500 mb-4">
              Please login or create an account to register as a service provider
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                Login / Register
              </button>
            </div>
          </div>
        ) : (
          <ServiceProviderForm
            serviceProviderId={serviceProviderId}
            onSuccess={handleSuccess}
            onCancel={onClose}
          />
        )}
      </div>
    </Modal>
  );
};

export default ServiceProviderModal;

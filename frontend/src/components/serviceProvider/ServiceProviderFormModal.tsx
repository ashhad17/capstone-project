
import React, { useState } from "react";
import Modal from "@/components/ui/modal";
import ServiceProviderForm from "./ServiceProviderForm";

interface ServiceProviderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  providerId?: string; // For edit mode
}

const ServiceProviderFormModal: React.FC<ServiceProviderFormModalProps> = ({
  isOpen,
  onClose,
  providerId,
}) => {
  const [success, setSuccess] = useState(false);

  const handleSuccess = () => {
    setSuccess(true);
    // Optionally close the modal after a delay
    setTimeout(() => {
      onClose();
      setSuccess(false);
    }, 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={providerId ? "Edit Service Provider" : "Add New Service Provider"}
      size="xl"
    >
      <div className="p-2">
        {/* Only render ServiceProviderForm if open to avoid unnecessary mounting */}
        {isOpen && (
          <ServiceProviderForm 
            onSuccess={handleSuccess} 
            onCancel={onClose}
            isEdit={!!providerId}
          />
        )}
      </div>
    </Modal>
  );
};

export default ServiceProviderFormModal;

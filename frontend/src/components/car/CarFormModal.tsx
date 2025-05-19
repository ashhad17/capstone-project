import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/modal";
import CarForm from "./CarForm";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

interface CarFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  carId?: string; // For edit mode
}

const CarFormModal: React.FC<CarFormModalProps> = ({
  isOpen,
  onClose,
  carId,
}) => {
  const [success, setSuccess] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch car data if editing an existing car
  useEffect(() => {
    if (isOpen && carId) {
      fetchCarData();
    } else {
      setInitialData(null);
    }
  }, [isOpen, carId]);

  const fetchCarData = async () => {
    if (!carId) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/cars/${carId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setInitialData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching car data:", error);
      toast({
        title: "Error",
        description: "Failed to load car data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
      title={carId ? "Edit Car Listing" : "Create New Listing"}
      size="xl"
    >
      <div className="p-2">
        {/* Show loading state while fetching car data */}
        {isOpen && loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading car data...</span>
          </div>
        )}

        {/* Only render CarForm when data is loaded or for new car */}
        {isOpen && (!carId || (carId && initialData && !loading)) && (
          <CarForm 
            onSuccess={handleSuccess} 
            onCancel={onClose}
            carId={carId}
            initialData={initialData}
          />
        )}
      </div>
    </Modal>
  );
};

export default CarFormModal;

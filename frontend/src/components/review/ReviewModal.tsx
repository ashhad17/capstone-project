
import React from 'react';
import Modal from "@/components/ui/modal";
import ReviewForm from './ReviewForm';
import { useToast } from '@/hooks/use-toast';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceProviderId: string;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  serviceProviderId
}) => {
  const { toast } = useToast();

  const handleSubmit = async (data: { rating: number; comment: string }) => {
    try {
      // Here you would typically make an API call to submit the review
      console.log('Submitting review:', { serviceProviderId, ...data });
      
      // Mock success for now
      toast({
        title: "Review Submitted",
        description: "Thank you for sharing your experience!",
      });
      
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "There was a problem submitting your review. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Write a Review"
      size="md"
    >
      <div className="p-4">
        <p className="text-gray-600 mb-4">
          Share your experience with this service provider to help others make informed decisions.
        </p>
        <ReviewForm
          serviceProviderId={serviceProviderId}
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      </div>
    </Modal>
  );
};

export default ReviewModal;

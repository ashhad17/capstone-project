
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, MessageCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ReviewList from "./ReviewList";
import ReviewModal from "./ReviewModal";
import FeedbackForm from "./FeedbackForm";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/context/ThemeContext";

interface ServiceReviewsProps {
  serviceProviderId: string;
  rating?: number;
  reviewCount?: number;
}

const ServiceReviews: React.FC<ServiceReviewsProps> = ({
  serviceProviderId,
  rating = 0,
  reviewCount = 0,
}) => {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { isDark } = useTheme();

  const handleWriteReview = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to write a review",
        variant: "destructive",
      });
      return;
    }
    setIsReviewModalOpen(true);
  };

  const handleFeedbackSubmit = (data: any) => {
    console.log("Feedback submitted:", data);
    setShowFeedbackForm(false);
    toast({
      title: "Feedback Received",
      description: "Thank you for your valuable feedback!",
    });
  };

  return (
    <Card className={`p-6 rounded-lg shadow-sm ${isDark ? 'bg-card' : 'bg-white'} glow-card`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold">Customer Reviews</h3>
          <div className="flex items-center mt-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.round(rating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="ml-2 text-sm text-muted-foreground">
              Based on {reviewCount} review{reviewCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button
            onClick={handleWriteReview}
            variant="glow"
            animation="scale"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Write a Review
          </Button>
          <Button 
            variant="outline"
            animation="scale"
            onClick={() => setShowFeedbackForm(!showFeedbackForm)}
          >
            Leave Feedback
          </Button>
        </div>
      </div>

      {showFeedbackForm && (
        <div className="mb-8 animate-fade-in">
          <FeedbackForm 
            onSubmit={handleFeedbackSubmit}
            title="Website Feedback"
            description="How was your experience using our website? Your feedback helps us improve."
          />
        </div>
      )}

      <ReviewList serviceProviderId={serviceProviderId} />
      
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        serviceProviderId={serviceProviderId}
      />
    </Card>
  );
};

export default ServiceReviews;

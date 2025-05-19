import React, { useState, useEffect } from "react";
import { Star, ThumbsUp, Flag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface Review {
  _id: string;
  title: string;
  comment: string;
  rating: number;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  helpful: number;
  reported: boolean;
}

interface ReviewListProps {
  serviceProviderId: string;
}

const ReviewList: React.FC<ReviewListProps> = ({ serviceProviderId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/service-providers/${serviceProviderId}/reviews`
      );

      if (response.data.success) {
        setReviews(response.data.data);
      } else {
        throw new Error("Failed to fetch reviews");
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError("Unable to load reviews at this time");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [serviceProviderId]);

  const markHelpful = async (reviewId: string) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/reviews/${reviewId}/helpful`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        // Update the review in the local state
        setReviews(prev => 
          prev.map(review => 
            review._id === reviewId
              ? { ...review, helpful: review.helpful + 1 }
              : review
          )
        );
      }
    } catch (err) {
      console.error("Error marking review as helpful:", err);
      toast({
        title: "Error",
        description: "Failed to mark review as helpful",
        variant: "destructive",
      });
    }
  };

  const reportReview = async (reviewId: string) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/reviews/${reviewId}/report`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        // Update the review in the local state
        setReviews(prev => 
          prev.map(review => 
            review._id === reviewId
              ? { ...review, reported: true }
              : review
          )
        );
      }
    } catch (err) {
      console.error("Error reporting review:", err);
      toast({
        title: "Error",
        description: "Failed to report review",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-12 bg-gray-50 rounded-md">
        <p className="text-destructive">{error}</p>
        <Button onClick={fetchReviews} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center p-12 bg-gray-50 rounded-md">
        <p className="text-gray-500">No reviews yet for this service provider</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
      {reviews.map((review) => (
          <motion.div
          key={review._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          className="border border-gray-200 rounded-md p-6 bg-white"
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              {review.user.avatar ? (
                <img
                  src={review.user.avatar}
                  alt={review.user.name}
                  className="h-12 w-12 rounded-full object-cover mr-4"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mr-4">
                  <User className="h-6 w-6 text-gray-500" />
                </div>
              )}
              <div>
                <h4 className="font-medium">{review.user.name}</h4>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-500 ml-2">
                    {format(new Date(review.createdAt), "MMM d, yyyy")}
                  </span>
                </div>
              </div>
            </div>
              <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markHelpful(review._id)}
                  className="flex items-center gap-1"
              >
                <ThumbsUp className="h-4 w-4" />
                  <span>{review.helpful}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                  onClick={() => reportReview(review._id)}
                  className="flex items-center gap-1"
                disabled={review.reported}
              >
                <Flag className="h-4 w-4" />
                  {review.reported ? "Reported" : "Report"}
              </Button>
            </div>
            </div>

            <h3 className="font-medium text-lg mt-4">{review.title}</h3>
            <p className="text-gray-600 mt-2 mb-4">{review.comment}</p>
          </motion.div>
      ))}
      </AnimatePresence>
    </div>
  );
};

export default ReviewList;

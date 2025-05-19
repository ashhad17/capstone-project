import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Star, MessageSquare, User, ThumbsUp, Flag } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ReviewForm from './ReviewForm';
import ReviewItem from './ReviewItem';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import axios from "axios";

interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  title: string;
  comment: string;
  helpful: number;
  reported: boolean;
  createdAt: string;
}

interface ReviewsSectionProps {
  entityId: string;
  entityType: 'service' | 'car' | 'serviceProvider';
  initialRating?: number;
  initialReviewCount?: number;
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ 
  entityId, 
  entityType,
  initialRating = 0,
  initialReviewCount = 0
}) => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [averageRating, setAverageRating] = useState(initialRating);
  const [reviewCount, setReviewCount] = useState(initialReviewCount);
  const { isDark } = useTheme();

  useEffect(() => {
    fetchReviews();
  }, [entityId]);

  const fetchReviews = async () => {
    try {
      console.log('Fetching reviews for entityId:', entityId);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/service-providers/${entityId}/reviews`
      );
      console.log('Raw API Response:', response);
      console.log('Reviews API Response Data:', response.data);
      
      if (response.data.success) {
        const reviewsData = response.data.data;
        console.log('Reviews data to be set:', reviewsData);
        
        // Ensure we have valid review data
        if (Array.isArray(reviewsData)) {
          setReviews(reviewsData);
          // Calculate average rating
          const totalRating = reviewsData.reduce((sum: number, review: Review) => sum + (review.rating || 0), 0);
          const avgRating = reviewsData.length > 0 ? totalRating / reviewsData.length : 0;
          console.log('Calculated average rating:', avgRating);
          console.log('Number of reviews:', reviewsData.length);
          
          setAverageRating(avgRating);
          setReviewCount(reviewsData.length);
        } else {
          console.error('Invalid reviews data format:', reviewsData);
          setReviews([]);
          setAverageRating(0);
          setReviewCount(0);
        }
      } else {
        console.error('API response indicates failure:', response.data);
        setReviews([]);
        setAverageRating(0);
        setReviewCount(0);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      if (axios.isAxiosError(error)) {
        console.error("Error response:", error.response?.data);
        console.error("Error status:", error.response?.status);
        console.error("Error URL:", error.config?.url);
      }
      toast({
        title: "Error",
        description: "Failed to fetch reviews",
        variant: "destructive",
      });
      setReviews([]);
      setAverageRating(0);
      setReviewCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit a review",
        variant: "destructive",
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Submitting review for entityId:', entityId);
      console.log('Review data:', {
        rating,
        title,
        comment,
        serviceProvider: entityId,
      });
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/service-providers/${entityId}/reviews`,
        {
          rating,
          title,
          comment,
          serviceProvider: entityId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log('Submit review response:', response.data);

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Your review has been submitted",
        });
        setIsReviewModalOpen(false);
        setRating(0);
        setTitle("");
        setComment("");
        fetchReviews();
      }
    } catch (error: any) {
      console.error("Error submitting review:", error);
      if (axios.isAxiosError(error)) {
        console.error("Error response:", error.response?.data);
        console.error("Error status:", error.response?.status);
        console.error("Error URL:", error.config?.url);
      }
    toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit review",
        variant: "destructive",
    });
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to mark a review as helpful",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/service-providers/${entityId}/reviews/${reviewId}/helpful`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        fetchReviews();
      }
    } catch (error) {
      console.error("Error marking review as helpful:", error);
      toast({
        title: "Error",
        description: "Failed to mark review as helpful",
        variant: "destructive",
      });
    }
  };

  const handleReportReview = async (reviewId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to report a review",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/service-providers/${entityId}/reviews/${reviewId}/report`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Review has been reported",
        });
        fetchReviews();
    }
    } catch (error) {
      console.error("Error reporting review:", error);
      toast({
        title: "Error",
        description: "Failed to report review",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
          <div>
          <h2 className="text-2xl font-bold">Reviews</h2>
            <div className="flex items-center mt-1">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                  key={star}
                      className={`h-5 w-5 ${
                    star <= Math.round(averageRating)
                          ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                      }`}
                    />
                ))}
            </div>
            <span className="ml-2 text-gray-600">
              {averageRating.toFixed(1)} ({reviewCount} reviews)
            </span>
          </div>
        </div>
        <Button onClick={() => setIsReviewModalOpen(true)}>Write a Review</Button>
        </div>

      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No reviews yet. Be the first to leave a review!
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="border-b pb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    {review.user.avatar ? (
                      <img
                        src={review.user.avatar}
                        alt={review.user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-500">
                        {review.user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="ml-3">
                    <div className="font-medium">{review.user.name}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                </div>
                  </div>
                </div>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= review.rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <h3 className="font-medium mb-2">{review.title}</h3>
              <p className="text-gray-600 mb-4">{review.comment}</p>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleMarkHelpful(review._id)}
                  className="flex items-center text-gray-500 hover:text-primary"
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  Helpful ({review.helpful})
                </button>
                <button
                  onClick={() => handleReportReview(review._id)}
                  className="flex items-center text-gray-500 hover:text-red-500"
                >
                  <Flag className="h-4 w-4 mr-1" />
                  Report
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
            <DialogDescription>
              Share your experience with this {entityType === "serviceProvider" ? "service provider" : "car"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Rating</Label>
              <div className="flex items-center mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summarize your experience"
              />
            </div>
            <div>
              <Label htmlFor="comment">Review</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience in detail"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitReview}>Submit Review</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewsSection;

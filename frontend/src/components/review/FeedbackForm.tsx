
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Star, ThumbsUp, ThumbsDown } from "lucide-react";

interface FeedbackFormProps {
  onSubmit?: (data: any) => void;
  className?: string;
  title?: string;
  description?: string;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  onSubmit,
  className = "",
  title = "Leave Your Feedback",
  description = "We'd love to hear your thoughts on our website and services.",
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  
  const handleMouseOver = (index: number) => {
    setHoveredRating(index);
  };
  
  const handleMouseLeave = () => {
    setHoveredRating(0);
  };
  
  const handleClick = (index: number) => {
    setRating(index);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rating) {
      toast({
        title: "Rating Required",
        description: "Please provide a star rating before submitting.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const data = {
        rating,
        feedback,
        name,
        email,
        date: new Date().toISOString(),
      };
      
      if (onSubmit) {
        onSubmit(data);
      }
      
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback!",
      });
      
      // Reset form
      setRating(0);
      setFeedback("");
      setName("");
      setEmail("");
      setIsLoading(false);
    }, 1000);
  };
  
  return (
    <Card className={`overflow-hidden glow-card ${className}`}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Rating</label>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((index) => (
                  <Star
                    key={index}
                    className={`h-6 w-6 cursor-pointer transition-colors ${
                      index <= (hoveredRating || rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                    onClick={() => handleClick(index)}
                    onMouseOver={() => handleMouseOver(index)}
                    onMouseLeave={handleMouseLeave}
                  />
                ))}
                <span className="ml-2 text-sm font-medium">
                  {rating > 0 ? `${rating} star${rating !== 1 ? "s" : ""}` : "Select a rating"}
                </span>
              </div>
            </div>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Your Name
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>
            
            <div>
              <label htmlFor="feedback" className="block text-sm font-medium mb-1">
                Your Feedback
              </label>
              <Textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us about your experience..."
                rows={4}
                required
                className="resize-none"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button 
              type="submit" 
              variant="glow"
              animation="scale"
              disabled={isLoading || !rating}
            >
              {isLoading ? "Submitting..." : "Submit Feedback"}
            </Button>
          </div>
        </form>
      </CardContent>
      
      <CardFooter className="flex justify-center border-t pt-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <button className="flex items-center gap-1 hover:text-primary transition-colors">
            <ThumbsUp className="h-4 w-4" />
            Helpful
          </button>
          <span>|</span>
          <button className="flex items-center gap-1 hover:text-primary transition-colors">
            <ThumbsDown className="h-4 w-4" />
            Not helpful
          </button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default FeedbackForm;

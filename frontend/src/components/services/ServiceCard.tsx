import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/context/ThemeContext";
import { motion } from "framer-motion";

interface ServiceProps {
  service: {
    _id: string;
    name: string;
    description: string;
    price: number;
    duration: string;
    category: string;
    image: {
      url: string;
      publicId: string;
    };
    serviceProvider: {
      _id: string;
      name: string;
      rating?: number;
      reviewCount?: number;
    };
    features: string[];
  };
}

const ServiceCard: React.FC<ServiceProps> = ({ service }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { isDark } = useTheme();

  const handleBookNow = () => {
    if (isAuthenticated) {
      navigate(`/service-providers/${service.serviceProvider._id}`);
    } else {
      navigate('/login');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1 }}
    >
      <Card className={`overflow-hidden hover:shadow-lg transition-all duration-300 ${isDark ? 'bg-gray-800 border-gray-700 hover:shadow-glow-dark' : 'hover:shadow-glow-light glow-card'}`}>
        <div className="relative h-48">
          <img 
            src={service.image.url} 
            alt={service.name}
            className="w-full h-full object-cover"
          />
          <Badge 
            className="absolute top-3 right-3 bg-primary text-white animate-pulse"
            variant="secondary"
          >
            {service.category.charAt(0).toUpperCase() + service.category.slice(1)}
          </Badge>
        </div>
        
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className={`text-xl ${isDark ? 'text-white' : ''}`}>{service.name}</CardTitle>
            <div className="flex items-center gap-1 text-yellow-500">
              <Star className="fill-yellow-500 h-4 w-4" />
              <span className="text-sm font-medium">
                {service.serviceProvider?.rating ? service.serviceProvider.rating.toFixed(1) : "No rating"}
              </span>
              {service.serviceProvider?.reviewCount && (
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  ({service.serviceProvider.reviewCount})
                </span>
              )}
            </div>
          </div>
          <CardDescription className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
            {service.serviceProvider?.name || "Unknown Provider"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pb-2">
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm mb-3`}>{service.description}</p>
          <div className="flex items-center mb-3">
            <Clock className={`h-4 w-4 mr-1 ${isDark ? 'text-gray-300' : 'text-gray-500'}`} />
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>{service.duration}</span>
          </div>
          <div className="flex flex-wrap gap-1 mb-1">
            {(service.features || []).slice(0, 2).map((feature, index) => (
              <Badge key={index} variant="outline" className={`text-xs ${isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-50'}`}>
                {feature}
              </Badge>
            ))}
            {service.features?.length > 2 && (
              <Badge variant="outline" className={`text-xs ${isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-50'}`}>
                +{service.features.length - 2} more
              </Badge>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between items-center pt-2">
          <div className={`text-xl font-bold ${isDark ? 'text-primary' : 'text-primary'}`}>
          ₹{service.price.toFixed(2)}
          </div>
          <Button 
            onClick={handleBookNow} 
            variant="glow" 
            animation="scale"
            className="hover:scale-105 transition-all duration-300 hover:shadow-glow"
          >
            Book Now
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ServiceCard;

// export default ServiceCard;
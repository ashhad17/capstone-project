import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ServiceType } from "@/lib/data";
import { useTheme } from "@/context/ThemeContext";
import { motion } from "framer-motion";

interface ServiceCardProps {
  service: ServiceType;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const { isDark } = useTheme();
  
  // Default image if none provided
  const serviceImage = service.image || "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=300&h=200";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.03 }}
    >
      <Card 
        glowEffect 
        hoverAnimation 
        className={`overflow-hidden transition-all hover:shadow-lg ${
          isDark ? 'bg-gray-800 border-gray-700 hover:shadow-glow-dark' : 'hover:shadow-glow-light'
        }`}
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <img
            src={serviceImage}
            alt={service.name}
            className="absolute inset-0 w-full h-full object-contain object-center transition-transform duration-500 hover:scale-110"
          />
          {service.featured && (
            <Badge className="absolute right-2 top-2 bg-yellow-500 animate-pulse">Featured</Badge>
          )}
        </div>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-lg font-bold truncate ${isDark ? 'text-white' : ''}`}>{service.name}</h3>
            <Badge 
              variant={service.available ? "default" : "outline"} 
              className={`${service.available ? "animate-glow-pulse" : ""} ${
                isDark && !service.available ? "border-gray-600 text-gray-400" : ""
              }`}
            >
              {service.available ? "Available" : "Unavailable"}
            </Badge>
          </div>
          
          <div className="flex items-center text-yellow-500 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < Math.round(service.rating) ? "fill-yellow-500" : ""}`}
              />
            ))}
            <span className={`text-sm ml-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              ({service.reviewCount} reviews)
            </span>
          </div>
          
          <p className={`mb-3 line-clamp-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{service.description}</p>
          
          {service.provider && (
            <div className="flex items-center gap-2 mb-3">
              <div className={`h-8 w-8 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-100'} overflow-hidden`}>
                {service.provider.image ? (
                  <img 
                    src={service.provider.image} 
                    alt={service.provider.name} 
                    className="h-full w-full object-cover" 
                  />
                ) : (
                  <div className={`h-full w-full ${isDark ? 'bg-primary/20' : 'bg-primary/10'} flex items-center justify-center text-primary font-bold`}>
                    {service.provider.name.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <p className={`text-sm font-medium flex items-center gap-1 ${isDark ? 'text-white' : ''}`}>
                  {service.provider.name}
                  {service.provider.verified && (
                    <CheckCircle className="h-3 w-3 text-blue-500" />
                  )}
                </p>
                {service.provider.location && (
                  <p className={`text-xs flex items-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <MapPin className="h-3 w-3 mr-1" />
                    {service.provider.location}
                  </p>
                )}
              </div>
            </div>
          )}
          
          <div className="flex justify-between items-center mt-4">
            <p className={`font-bold text-xl ${isDark ? 'text-white' : ''}`}>₹{service.price}</p>
            <Button 
              variant="glow" 
              animation="scale" 
              asChild
              className="hover:scale-105 transition-all duration-300 hover:shadow-glow"
            >
              <Link to={`/services/${service.id}`}>View Details</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ServiceCard;

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { useTheme } from "@/context/ThemeContext";
import { motion } from "framer-motion";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

interface Service {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: {
    url: string;
    publicId: string;
  };
  featured: boolean;
  category: string;
  duration: string;
  serviceProvider: {
    _id: string;
  };
}

interface ServiceSectionProps {
  services?: Service[];
}

const ServiceSection: React.FC<ServiceSectionProps> = ({ services: providedServices }) => {
  const { isDark } = useTheme();
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/services`
        );
        
        if (response.data.success) {
          setServices(response.data.data);
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch services",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error fetching services:", error);
        toast({
          title: "Error",
          description: "Failed to fetch services",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (!providedServices) {
      fetchServices();
    } else {
      setServices(providedServices);
      setLoading(false);
    }
  }, [providedServices, toast]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Animation variants
  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.3
      }
    }
  };
  
  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };
  
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  if (loading) {
    return (
      <div className={`section-padding ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.section 
      className={`section-padding ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={sectionVariants}
    >
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          variants={headerVariants}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Explore Our <span className="text-gradient">Services</span>
          </h2>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            We offer a wide range of automotive services to keep your vehicle
            running smoothly.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <motion.div
              key={service._id}
              className={`rounded-xl shadow-lg overflow-hidden border border-transparent transition-all duration-300 ${
                isDark ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'
              }`}
              variants={cardVariants}
              whileHover={{ 
                scale: 1.03,
                boxShadow: isDark ? 
                  '0 0 20px 2px rgba(59, 130, 246, 0.3)' : 
                  '0 0 20px 2px rgba(59, 130, 246, 0.2)',
                borderColor: 'rgba(59, 130, 246, 0.5)'
              }}
            >
              <motion.img
                src={service.image.url}
                alt={service.name}
                className="w-full h-48 object-cover"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                  {service.description}
                </p>
                <div className="flex flex-col gap-2 mb-4">
                  <span className="text-sm text-gray-500">
                    Duration: {service.duration}
                  </span>
                  <span className="text-sm text-gray-500">
                    Category: {service.category}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <motion.span 
                    className="text-primary font-bold"
                    whileHover={{ scale: 1.1 }}
                  >
                    ₹{formatPrice(service.price)}
                  </motion.span>
                  
                  <Link to={`/service-providers/${service.serviceProvider._id}`}>
                  {/* <Link to={`/service-providers/${service._id}`}> */}
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="secondary">Learn More</Button>
                    </motion.div>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default ServiceSection;

import React, { useState, useEffect } from "react";
import ServiceCard from "./ServiceCard";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/context/ThemeContext"; // Import useTheme hook
import axios from "axios";

interface Service {
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
  };
  features: string[];
}

interface ServicesListProps {
  category: string | null;
}

const ServicesList: React.FC<ServicesListProps> = ({ category }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const { toast } = useToast();
  const { isDark } = useTheme(); // Use isDark from ThemeContext

  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/v1/services`
        );

        // Log the response to verify its structure
        console.log("API Response:", response.data);

        // Extract the services from the `data` property
        const allServices = Array.isArray(response.data.data) ? response.data.data : [];

        // Filter services by category if a category is selected
        if (category && category !== "all") {
          setServices(allServices.filter((service: Service) => service.category === category));
        } else {
          setServices(allServices);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
        toast({
          title: "Error",
          description: "Failed to fetch services. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [category, toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div
        className={`text-center py-12 rounded-lg ${
          isDark ? "bg-gray-800 text-gray-300" : "bg-gray-50 text-gray-600"
        }`}
      >
        <h3 className="text-lg font-medium mb-2">No services found</h3>
        <p>Try adjusting your filters or category selection.</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service) => (
        <ServiceCard key={service._id} service={service} />
      ))}
    </div>
  );
};

export default ServicesList;
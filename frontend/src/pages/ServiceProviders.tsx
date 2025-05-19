
import React from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ServiceGrid from "@/components/service/ServiceGrid";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { motion } from "framer-motion";
import  ServiceProviderFormModal  from "../components/serviceProvider/ServiceProviderFormModal";
const ServiceProviders = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handlePartnerClick = () => {
    if (isAuthenticated) {
      setIsModalOpen(true);
      // navigate('/service-provider-dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-gray-900 text-white' : ''}`}>
      <Helmet>
        <title>Service Providers | WheelsTrust</title>
      </Helmet>
      <Navbar />
      <main className={`flex-grow pt-24 pb-16 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4">
          <motion.div 
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div>
              <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${isDark ? 'text-white' : ''}`}>
                Service Providers
              </h1>
              <p className={`max-w-3xl ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Find trusted service providers for maintenance, repairs, and 
                inspections. All service providers are vetted and reviewed by 
                our community of car owners.
              </p>
            </div>
            <Button 
              className="mt-4 md:mt-0 hover:scale-105 hover:shadow-glow transition-all duration-300"
              variant="glow"
              animation="scale"
              onClick={handlePartnerClick}
            >
              Become a Partner
            </Button>
          </motion.div>
          
          <ServiceGrid />
        </div>
        <ServiceProviderFormModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}              
        
        />
      </main>

      <Footer />
    </div>
  );
};

export default ServiceProviders;

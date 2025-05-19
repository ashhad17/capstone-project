import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import CarListingPreview from "@/components/home/CarListingPreview";
import ServiceSection from "@/components/home/ServiceSection";
import Testimonials from "@/components/home/Testimonials";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import { motion } from "framer-motion";

const Index = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  
  const handlePartnerClick = () => {
    navigate('/service-provider-dashboard');
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Features />
        <CarListingPreview cars={[]} />
        <motion.section 
          className="py-16 bg-primary-50"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="container mx-auto px-4 text-center">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-4"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Partner With Us
            </motion.h2>
            <motion.p 
              className="text-gray-600 max-w-2xl mx-auto mb-8"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Are you a service provider? Join our network of trusted mechanics, body shops,
              and inspection services to grow your business.
            </motion.p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Button 
                size="lg"
                className="px-8 bg-primary hover:bg-primary/90"
                onClick={handlePartnerClick}
              >
                Become a Service Partner
              </Button>
            </motion.div>
          </div>
        </motion.section>
        <ServiceSection />
        {/* <Testimonials /> */}
      </main>
      <Footer />
    </div>
  );
};

export default Index;

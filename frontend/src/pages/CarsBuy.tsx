
import React from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CarGrid from "@/components/car/CarGrid";
import { Button } from "@/components/ui/button";
import { useAuthModal } from "@/components/auth/AuthModalProvider";
import { useTheme } from "@/context/ThemeContext";
import { motion } from "framer-motion";

const CarsBuy = () => {
  const { openModal } = useAuthModal();
  const { isDark } = useTheme();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2,
        duration: 0.5
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 } 
    }
  };

  return (
    <>
      <Helmet>
        <title>Buy Cars | WheelsTrust</title>
      </Helmet>
      
      <Navbar />
      
      <motion.main 
        className={`pt-24 pb-16 ${isDark ? 'bg-gray-900 text-white' : ''}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <section className="container mx-auto px-4">
          <motion.div 
            className="max-w-4xl mx-auto mb-12"
            variants={itemVariants}
          >
            <h1 className={`text-3xl md:text-4xl font-bold mb-4 ${isDark ? 'text-white' : ''}`}>
              Find Your Perfect Car
            </h1>
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              Browse our selection of quality vehicles from trusted sellers. Each car is verified 
              and comes with a detailed history report.
            </p>
            
            <div className="mt-8">
              <motion.div className="inline-block mr-4" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  className="hover:shadow-glow transition-all duration-300"
                  onClick={() => openModal()}
                >
                  Register to Save Favorites
                </Button>
              </motion.div>
              
              <motion.div className="inline-block" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  className={`transition-all duration-300 ${
                    isDark ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' : ''
                  }`}
                  onClick={() => window.location.href = "/find-your-car"}
                >
                  Car Finder Tool
                </Button>
              </motion.div>
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <CarGrid />
          </motion.div>
        </section>
      </motion.main>
      
      <Footer />
    </>
  );
};

export default CarsBuy;

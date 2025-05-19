
import React from "react";
import { Search, Info, Settings, LayoutDashboard } from "lucide-react";
import { features } from "@/lib/data";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { useTheme } from "@/context/ThemeContext";
import { motion } from "framer-motion";

const featureIcons = {
  search: <Search className="h-6 w-6" />,
  info: <Info className="h-6 w-6" />,
  settings: <Settings className="h-6 w-6" />,
  dashboard: <LayoutDashboard className="h-6 w-6" />,
};

const Features = () => {
  const { isDark } = useTheme();
  
  // Animation variants for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <motion.section 
      className={`${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50'} section-padding`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={containerVariants}
    >
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          variants={itemVariants}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose <span className="text-gradient">WheelsTrust</span>
          </h2>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            We're revolutionizing the way people buy, sell, and service vehicles by
            prioritizing transparency and building trust between all parties.
          </p>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className={`rounded-xl p-6 shadow-lg ${
                isDark ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'
              } border border-transparent transition-all duration-300 hover:border-primary/30`}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.03,
                boxShadow: isDark ? 
                  '0 0 20px 2px rgba(59, 130, 246, 0.3)' : 
                  '0 0 20px 2px rgba(59, 130, 246, 0.2)'
              }}
            >
              <motion.div
                className={`rounded-full w-12 h-12 flex items-center justify-center mb-4 ${
                  isDark ? 'bg-primary/20' : 'bg-primary/10'
                }`}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                {featureIcons[feature.icon as keyof typeof featureIcons]}
              </motion.div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default Features;

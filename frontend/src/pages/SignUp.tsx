
import React from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SignUpForm from "@/components/auth/SignUpForm";
import { useTheme } from "@/context/ThemeContext";
import { motion } from "framer-motion";

const SignUp = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme(); // Use `isDark` and `toggleTheme` from ThemeContext

  const handleComplete = () => {
    navigate('/');
  };

  const handleCancel = () => {
    navigate('/login');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      <Helmet>
        <title>Sign Up | WheelsTrust</title>
      </Helmet>
      
      <Navbar />
      
      <motion.main 
        className="flex-grow flex items-center justify-center py-12"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div 
          className={`w-full max-w-md mx-auto p-8 rounded-lg shadow-md ${isDark ? "bg-gray-800" : "bg-white"}`}
          variants={itemVariants}
          whileHover={{ 
            boxShadow: isDark ? 
              "0px 0px 20px 1px rgba(59, 130, 246, 0.3)" : 
              "0px 0px 20px 1px rgba(59, 130, 246, 0.15)" 
          }}
        >
          <motion.h1 
            className="text-2xl font-bold text-center mb-6"
            variants={itemVariants}
          >
            Create an Account
          </motion.h1>
          
          <motion.div variants={itemVariants}>
            <SignUpForm 
              onComplete={handleComplete}
              onCancel={handleCancel}
            />
          </motion.div>
          
          <motion.div 
            className="mt-6 text-center"
            variants={itemVariants}
          >
            <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
              Already have an account?{" "}
              <Link to="/login" className={`${isDark ? "text-blue-400" : "text-primary"} hover:underline font-semibold`}>
                Login
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </motion.main>
      
      <Footer />

      {/* Dark Mode Toggle with animation */}
      <motion.div 
        className="absolute top-4 right-4"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <motion.button
          onClick={toggleTheme}
          className={`px-4 py-2 rounded-md ${isDark ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-900"}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isDark ? "Light Mode" : "Dark Mode"}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default SignUp;

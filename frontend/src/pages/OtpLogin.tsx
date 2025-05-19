
import React from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import OTPLoginForm from "@/components/auth/OTPLoginForm";
import { useTheme } from "@/context/ThemeContext";
import { motion } from "framer-motion";

const OtpLogin = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleComplete = () => {
    navigate("/");
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
    <div className={`min-h-screen flex flex-col ${theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
      <Helmet>
        <title>OTP Login | WheelsTrust</title>
      </Helmet>

      <Navbar />

      <motion.main 
        className="flex-grow flex items-center justify-center py-12"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div 
          className={`w-full max-w-md mx-auto p-8 rounded-lg shadow-md ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}
          variants={itemVariants}
          whileHover={{ 
            boxShadow: theme === "dark" ? 
              "0px 0px 20px 1px rgba(59, 130, 246, 0.3)" : 
              "0px 0px 20px 1px rgba(59, 130, 246, 0.15)" 
          }}
          transition={{ duration: 0.3 }}
        >
          <motion.h1 
            className="text-2xl font-bold text-center mb-6"
            variants={itemVariants}
          >
            Login with OTP
          </motion.h1>

          <motion.div 
            className="mb-6 flex justify-between items-center"
            variants={itemVariants}
          >
            <Link to="/login" className={`text-sm ${theme === "dark" ? "text-blue-400" : "text-primary"} hover:underline flex items-center`}>
              ← Back to login options
            </Link>
            {/* <button
              onClick={toggleTheme}
              className="text-sm px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Toggle Theme
            </button> */}
          </motion.div>

          <motion.div variants={itemVariants}>
            <OTPLoginForm onComplete={handleComplete} />
          </motion.div>
        </motion.div>
      </motion.main>

      <Footer />
    </div>
  );
};

export default OtpLogin;

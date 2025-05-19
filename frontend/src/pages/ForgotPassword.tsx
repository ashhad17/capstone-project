
import React from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    navigate('/login');
  };

  const handleCancel = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Forgot Password | WheelsTrust</title>
      </Helmet>
      
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center bg-gray-50 py-12">
        <div className="w-full max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center mb-6">Reset Your Password</h1>
          
          <ForgotPasswordForm 
            onComplete={handleComplete}
            onCancel={handleCancel}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ForgotPassword;

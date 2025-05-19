import React from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LoginForm from "@/components/auth/LoginForm";
import { useTheme } from "@/context/ThemeContext";

const Login = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme(); // Use `isDark` and `toggleTheme` from ThemeContext

  const handleComplete = () => {
    navigate('/');
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  const handleOtpLogin = () => {
    navigate('/otp-login');
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      <Helmet>
        <title>Login | WheelsTrust</title>
      </Helmet>
      
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center py-12">
        <div className={`w-full max-w-md mx-auto p-8 rounded-lg shadow-md ${isDark ? "bg-gray-800" : "bg-white"}`}>
          <h1 className="text-2xl font-bold text-center mb-6">Login to Your Account</h1>
          
          <LoginForm 
            onComplete={handleComplete}
            onForgotPassword={handleForgotPassword}
            onOtpLogin={handleOtpLogin}
          />
          
          {/* <div className="mt-6 text-center">
            <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
              Don't have an account?{" "}
              <Link to="/signup" className={`${isDark ? "text-blue-400" : "text-primary"} hover:underline font-semibold`}>
                Sign Up
              </Link>
            </p>
          </div> */}
        </div>
      </main>
      
      <Footer />

      {/* Dark Mode Toggle */}
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme} // Use the `toggleTheme` function from ThemeContext
          className={`px-4 py-2 rounded-md ${isDark ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-900"}`}
        >
          {isDark ? "Light Mode" : "Dark Mode"}
        </button>
      </div>
    </div>
  );
};

export default Login;
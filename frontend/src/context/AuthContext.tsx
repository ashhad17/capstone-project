import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export type UserRole = "user" | "admin" | "service_provider";

type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  joinedDate?: string;
  address?: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  redirectToLogin: () => void;
  updateUser: (userData: Partial<User>) => void;
  handleVerifyOTP: (email: string, otp: string) => Promise<void>;
  loginWithOtp: (phone: string, otp: string) => Promise<any>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [responseData, setResponseData] = useState<any>(null);  
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if there's a stored token and fetch user data
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserData(token);
    }
  }, []);

  const fetchUserData = async (token: string) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/auth/me`, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setResponseData(response); // Store the response data for debugging
      if (response.data.success) {
        const userData = response.data.data;
        setUser({
          id: userData._id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          avatar: userData.avatar,
          phone: userData.phone,
          joinedDate: userData.createdAt ? new Date(userData.createdAt).toISOString().split('T')[0] : undefined
        });
        console.log("Fetched user data:", userData);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      localStorage.removeItem('token');
    }
  };
  const handleVerifyOTP = async (email: string, otp: string) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/auth/verify-otp`,
        { email, otp }
      );
      if (response.data.success) {
        const { token, data: userData } = response.data;
        localStorage.setItem('token', token);
        const user = {
          id: userData?._id || "unknown",
          name: userData?.name || "Unknown User",
          email: userData?.email || email,
          role: (userData?.role as UserRole) || "user",
          avatar: userData?.avatar,
          phone: userData?.phone,
          joinedDate: userData?.createdAt
            ? new Date(userData.createdAt).toISOString().split('T')[0]
            : undefined,
        };
        setUser(user);
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        navigate('/');
      } else {
        toast({
          title: "Verification Failed",
          description: response.data.error || "Invalid OTP",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "An error occurred during OTP verification.";
      toast({
        title: "Verification Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };
  const loginWithOtp = async (phone: string, otp: string) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/auth/verify-phone-otp`,
        { phone, otp }
      );
      if (response.data.success) {
        const { token, data: userData } = response.data;
        localStorage.setItem('token', token);
        const user = {
          id: userData?._id || "unknown",
          name: userData?.name || "Unknown User",
          email: userData?.email || "",
          role: (userData?.role as UserRole) || "user",
          avatar: userData?.avatar,
          phone: userData?.phone || phone,
          joinedDate: userData?.createdAt
            ? new Date(userData.createdAt).toISOString().split('T')[0]
            : undefined,
        };
        setUser(user);
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        navigate('/');
        return response.data;
      } else {
        toast({
          title: "Verification Failed",
          description: response.data.error || "Invalid OTP",
          variant: "destructive",
        });
        throw new Error(response.data.error || "Invalid OTP");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "An error occurred during OTP verification.";
      toast({
        title: "Verification Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };
  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/auth/login`, 
        { email, password }
      );
      setResponseData(response); // Store the response data for debugging
      if (response.data.success) {
        console.log("Login response:", response.data);
        
        // Get token and user data from response
        const { token, data: userData } = response.data;
        
        // Save token to localStorage
        localStorage.setItem('token', token);
        
        // Safely handle potentially missing data
        const user = {
          id: userData?._id || "unknown",
          name: userData?.name || "Unknown User",
          email: userData?.email || email,
          role: (userData?.role as UserRole) || "user",
          avatar: userData?.avatar,
          phone: userData?.phone,
          joinedDate: userData?.createdAt ? new Date(userData.createdAt).toISOString().split('T')[0] : undefined
        };
        
        setUser(user);
        console.log("Logged in as:", user);
        
        toast({
          title: "Login Successful",
          description: "Welcome back!"
        });
      } else {
        console.error("Login failed:", response.data.error);
        toast({
          title: "Login Failed",
          description: response.data.error || "Invalid credentials",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);
  
      // Extract error message from backend response
      const errorMessage = error.response?.data?.error?.message || "An error occurred during login.";
  
      // Display the error message in the toast
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive"
      });
  
      throw error;
    }
  };
  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/auth/register`, 
        { name, email, password }
      );
  
      if (response.data.success) {
        const { token, data: userData } = response.data;
  
        // Save token to localStorage
        localStorage.setItem('token', token);
  
        // Safely handle potentially missing data
        const user = {
          id: userData?._id || "unknown",
          name: userData?.name || name,
          email: userData?.email || email,
          role: (userData?.role as UserRole) || "user",
          joinedDate: userData?.createdAt ? new Date(userData.createdAt).toISOString().split('T')[0] : undefined
        };
  
        setUser(user);
  
        toast({
          title: "Registration Successful",
          description: "Welcome to WheelsTrust! \n"+response.data.message
        });
      } else {
        console.error("Registration failed:", response.data.error);
        toast({
          title: "Registration Failed",
          description: response.data.error || "Could not create account",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Registration error:", error);
  
      // Correctly extract the error message from the backend response
      // const errorMessage = error || "An error occurred during registration.";
  const errorMessage=error;
      // Display the error message in the toast
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive"
      });
  
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out"
    });
    navigate('/');
  };

  const redirectToLogin = () => {
    navigate('/login');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({...user, ...userData});
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        redirectToLogin,
        updateUser,
        handleVerifyOTP,
        loginWithOtp
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

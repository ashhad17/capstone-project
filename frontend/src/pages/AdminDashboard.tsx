import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Navigate, Link } from "react-router-dom";
import { 
  Car, 
  Users, 
  Settings, 
  User, 
  LogOut, 
  Home, 
  Menu,
  Bell,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import AdminNotifications from "@/components/admin/AdminNotifications";
import UserManagement from "@/components/admin/UserManagement";
import ServiceProviderManagement from "@/components/admin/ServiceProviderManagement";
import CarListingManagement from "@/components/admin/CarListingManagement";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import axios from "axios";
import { useNotifications } from '@/hooks/useNotifications';

// Dashboard stats interface
interface DashboardStats {
  userCount: number;
  carListingsCount: number;
  serviceProvidersCount: number;
  totalRevenue: number;
}

const AdminDashboard = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const { notifications } = useNotifications();
  const [activeTab, setActiveTab] = useState<"dashboard" | "users" | "listings" | "providers" | "settings" | "notifications">("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    userCount: 0,
    carListingsCount: 0,
    serviceProvidersCount: 0,
    totalRevenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const unreadNotificationsCount = notifications?.filter(n => !n.read).length || 0;

  useEffect(() => {
    // Get token from localStorage
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
    
    fetchDashboardStats(storedToken);
  }, []);

  const fetchDashboardStats = async (authToken: string | null) => {
    if (!authToken) {
      console.error("No auth token available");
      toast({
        title: "Authentication Error",
        description: "Please login again to access the dashboard",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // Fetch user count
      const usersResponse = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/users`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      
      // Fetch car listings count
      const carsResponse = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/cars`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      
      // Fetch service providers count
      const providersResponse = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/service-providers`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      
      // Calculate total revenue (mockup for now)
      const totalRevenue = 24530; // This would come from a real API in production

      setStats({
        userCount: usersResponse.data.data.length,
        carListingsCount: carsResponse.data.data.length,
        serviceProvidersCount: providersResponse.data.data.serviceProviders.length,
        totalRevenue: totalRevenue
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard statistics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect if not authenticated or not admin
  if (!isAuthenticated || user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out"
    });
  };

  const pageContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const statCardVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <motion.div 
        className={`flex-grow pt-16 ${isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}
        variants={pageContainerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex">
          {/* Sidebar */}
          <motion.div 
            className={`fixed top-16 left-0 bottom-0 z-30 transition-all duration-300 ${
              sidebarOpen ? "w-64" : "w-0"
            } ${isDark ? 'bg-gray-800 border-r border-gray-700' : 'bg-white shadow-lg'}`}
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: sidebarOpen ? 0 : -100, opacity: sidebarOpen ? 1 : 0 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            <div className="p-4">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>
              
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "dashboard"
                      ? "bg-primary text-white glow-btn"
                      : `hover:bg-gray-100 ${isDark ? 'hover:bg-gray-700' : ''}`
                  }`}
                >
                  <Home className="h-5 w-5" />
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab("users")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "users"
                      ? "bg-primary text-white glow-btn"
                      : `hover:bg-gray-100 ${isDark ? 'hover:bg-gray-700' : ''}`
                  }`}
                >
                  <Users className="h-5 w-5" />
                  Users
                </button>
                <button
                  onClick={() => setActiveTab("listings")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "listings"
                      ? "bg-primary text-white glow-btn"
                      : `hover:bg-gray-100 ${isDark ? 'hover:bg-gray-700' : ''}`
                  }`}
                >
                  <Car className="h-5 w-5" />
                  Car Listings
                </button>
                <button
                  onClick={() => setActiveTab("providers")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "providers"
                      ? "bg-primary text-white glow-btn"
                      : `hover:bg-gray-100 ${isDark ? 'hover:bg-gray-700' : ''}`
                  }`}
                >
                  <Settings className="h-5 w-5" />
                  Service Providers
                </button>
                <button
                  onClick={() => setActiveTab("notifications")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "notifications"
                      ? "bg-primary text-white glow-btn"
                      : `hover:bg-gray-100 ${isDark ? 'hover:bg-gray-700' : ''}`
                  }`}
                >
                  <Bell className="h-5 w-5" />
                  Notifications
                  {unreadNotificationsCount > 0 && (
                    <Badge className="ml-auto bg-red-500 text-white">{unreadNotificationsCount}</Badge>
                  )}
                </button>
                

                <button
                  onClick={toggleTheme}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-gray-100 ${isDark ? 'hover:bg-gray-700' : ''}`}
                >
                  {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </button>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors mt-4"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              </nav>
            </div>
          </motion.div>

          {/* Main Content */}
          <div 
            className={`transition-all duration-300 ${
              sidebarOpen ? "ml-64" : "ml-0"
            } flex-1`}
          >
            <div className="p-6">
              <motion.div 
                className="flex items-center mb-6"
                variants={itemVariants}
              >
                <button 
                  onClick={toggleSidebar}
                  className={`mr-4 p-2 rounded-lg hover:bg-gray-200 ${isDark ? 'hover:bg-gray-700' : ''} transition-colors`}
                >
                  <Menu className="h-5 w-5" />
                </button>
                <h1 className="text-2xl font-bold">
                  {activeTab === "dashboard" && "Admin Dashboard"}
                  {activeTab === "users" && "User Management"}
                  {activeTab === "listings" && "Car Listings"}
                  {activeTab === "providers" && "Service Providers"}
                  {activeTab === "settings" && "Settings"}
                  {activeTab === "notifications" && "Notifications"}
                </h1>
              </motion.div>

              {/* Dashboard Content */}
              {activeTab === "dashboard" && (
                <div className="space-y-6">
                  {/* Stats */}
                  {isLoading ? (
                    <div className="flex justify-center py-10">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <motion.div 
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                      variants={itemVariants}
                    >
                      <motion.div variants={statCardVariants}>
                        <Card glowEffect className="dashboard-card">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-gray-500 dark:text-gray-300 text-sm">Total Users</p>
                              <p className="text-2xl font-bold">{stats.userCount}</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Users className="h-5 w-5 text-primary" />
                            </div>
                          </div>
                          <p className="mt-2 text-xs text-green-600 dark:text-green-400">
                            <span className="font-medium">↑ 12%</span> since last month
                          </p>
                        </Card>
                      </motion.div>
                      
                      <motion.div variants={statCardVariants}>
                        <Card glowEffect className="dashboard-card">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-gray-500 dark:text-gray-300 text-sm">Active Listings</p>
                              <p className="text-2xl font-bold">{stats.carListingsCount}</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                              <Car className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                          </div>
                          <p className="mt-2 text-xs text-green-600 dark:text-green-400">
                            <span className="font-medium">↑ 5%</span> since last week
                          </p>
                        </Card>
                      </motion.div>
                      
                      <motion.div variants={statCardVariants}>
                        <Card glowEffect className="dashboard-card">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-gray-500 dark:text-gray-300 text-sm">Service Providers</p>
                              <p className="text-2xl font-bold">{stats.serviceProvidersCount}</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                              <Settings className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                          </div>
                          <p className="mt-2 text-xs text-green-600 dark:text-green-400">
                            <span className="font-medium">↑ 8%</span> since last month
                          </p>
                        </Card>
                      </motion.div>

                      
                      
                    </motion.div>
                  )}

                  {/* Recent Activity */}
                  <motion.div 
                    variants={itemVariants}
                    className="dashboard-card rounded-lg overflow-hidden"
                  >
                    <div className="px-6 py-4 border-b dark:border-gray-700">
                      <h3 className="text-lg font-medium">Recent Activity</h3>
                    </div>
                    <div className="px-6 py-4">
                      <div className="space-y-4">
                        <motion.div 
                          className="flex items-center"
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.1 }}
                        >
                          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                            <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm">
                              <span className="font-medium">Michael Chen</span> registered a new account
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
                          </div>
                        </motion.div>

                        <motion.div 
                          className="flex items-center"
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
                            <Car className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="text-sm">
                              <span className="font-medium">Sarah Johnson</span> added a new car listing
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">5 hours ago</p>
                          </div>
                        </motion.div>

                        <motion.div 
                          className="flex items-center"
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-3">
                            <Settings className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <p className="text-sm">
                              <span className="font-medium">AutoCare Express</span> joined as a service provider
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Yesterday</p>
                          </div>
                        </motion.div>

                        <motion.div 
                          className="flex items-center"
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.4 }}
                        >
                          <div className="h-8 w-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mr-3">
                            <Bell className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                          </div>
                          <div>
                            <p className="text-sm">
                              <span className="font-medium">Jessica Rodriguez</span> left a new review
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Yesterday</p>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Users Tab */}
              {activeTab === "users" && (
                <motion.div 
                  className={`rounded-lg shadow p-6 dashboard-card`}
                  variants={itemVariants}
                >
                  <UserManagement />
                </motion.div>
              )}

              {/* Car Listings Tab */}
              {activeTab === "listings" && (
                <motion.div 
                  className={`rounded-lg shadow p-6 dashboard-card`}
                  variants={itemVariants}
                >
                  <CarListingManagement />
                </motion.div>
              )}

              {/* Service Providers Tab */}
              {activeTab === "providers" && (
                <motion.div 
                  className={`rounded-lg shadow p-6 dashboard-card`}
                  variants={itemVariants}
                >
                  <ServiceProviderManagement />
                </motion.div>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <motion.div variants={itemVariants}>
                  <AdminNotifications />
                </motion.div>
              )}

              {/* Settings Tab */}
          
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;

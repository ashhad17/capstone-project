import React, { useState, useEffect } from "react";

import { useTheme } from "@/context/ThemeContext";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, User, Home, Bell, Calendar, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from "axios";
import ServiceModal from "@/components/service/ServiceModal";
import BookingStatusDropdown from "@/components/ui/bookingStatusDropDown";
import BookingDetailsModal from "@/components/ui/BookingDetailsModal";
const ServiceProviderDashboard = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>('pending');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
   const { isDark } = useTheme();
  const navigate = useNavigate();
  const [serviceProviderResponse, setServiceProviderResponse] = useState(null);
  type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    description: "",
    location: {
      address: "",
      city: "",
      state: "",
      zipCode: "",
    },
    specialties: [],
    website: "",
  });
  const handleViewDetails = (booking: any) => {
    setSelectedBooking(booking); // Set the selected booking
    setIsBookingModalOpen(true); // Open the modal
  };
  const handleAddService = () => {
    setSelectedService(null); // Clear selected service for adding
    setIsModalOpen(true);
  };

  const handleEditService = (service: any) => {
    console.log("Testing",service);
    setSelectedService(service); // Set the selected service for editing
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    await fetchProviderData(); // Refresh the services list
  };

  interface Booking {
    id: string;
    status: BookingStatus;
    // other properties...
  }
  
  useEffect(() => {
    if (isAuthenticated && user && user?.role === "service_provider") {
      fetchProviderData();
    }
  }, [isAuthenticated, user,bookingStatus]);

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/v1/bookings/${bookingId}/status`,
        { status: newStatus },
        
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookingStatus(newStatus as BookingStatus);
  
      toast({
        title: "Booking Updated",
        description: `Status changed to "${newStatus}" successfully.`,
        
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update booking status. Try again.",
        variant: "destructive",
      });
    }
     
  };
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
  
      // Merge profileData with the rest of the serviceProviderResponse
      const updatedData = {
        ...serviceProviderResponse, // Include all existing data
        ...profileData, // Override with form data
      };
  
      // Send the merged data in the API request
      await axios.put(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/v1/service-providers/${serviceProviderResponse?._id}`,
        updatedData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
        variant: "default",
      });
  
      // Refresh provider data
      fetchProviderData();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };
  const fetchProviderData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
  
      // Fetch service provider details
      const serviceProviderResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/v1/service-providers/by-user/${user?.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      const serviceProviderData = serviceProviderResponse.data;
      setServiceProviderResponse(serviceProviderData);
  
      // Populate profileData state
      setProfileData({
        name: serviceProviderData.name || "",
        email: serviceProviderData.email || "",
        phone: serviceProviderData.phone || "",
        description: serviceProviderData.description || "",
        location: {
          address: serviceProviderData.location?.address || "",
          city: serviceProviderData.location?.city || "",
          state: serviceProviderData.location?.state || "",
          zipCode: serviceProviderData.location?.zipCode || "",
        },
        specialties: serviceProviderData.specialties || [],
        website: serviceProviderData.website || "",
      });
  
      // Fetch services
      if (serviceProviderData.services && serviceProviderData.services.length > 0) {
        const servicesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/v1/services`,
          {
            params: { ids: serviceProviderData.services },
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setServices(servicesResponse.data.data || []);
      } else {
        setServices([]);
      }
  
      // Fetch bookings
      const bookingsResponse = await axios.get(
        `http://localhost:5000/api/v1/bookings/provider/${serviceProviderData._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      setBookings(bookingsResponse.data.data || []);
    } catch (error) {
      console.error("Error fetching provider data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "service_provider") {
    return <Navigate to="/" replace />;
  }

  
  const handleBookingStatusChange = (id: any, newStatus: BookingStatus) => {
    updateBookingStatus(id, newStatus);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Helmet>
        <title>Service Provider Dashboard | WheelsTrust</title>
      </Helmet>
      <Navbar />
      <div className={`flex-grow pt-24 pb-16 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar */}
            <aside className={`md:w-1/4 ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} p-6 rounded-lg shadow-sm h-fit`}>              <div className="mb-8 flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{serviceProviderResponse?.name || "Service Provider"}</h3>
                  <p className="text-sm text-gray-500">Service Provider</p>
                </div>
              </div>
              
              <nav className="space-y-2">
                <button
  className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-left ${
    activeTab === "dashboard"
      ? isDark
        ? "bg-primary text-white"
        : "bg-primary text-white"
      : isDark
      ? "hover:bg-gray-700"
      : "hover:bg-gray-100"
  }`}

                 onClick={() => setActiveTab("dashboard")}
                >
                  <Home className="h-5 w-5" />
                  Dashboard
                </button>
                <button
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-left ${activeTab === "services" ? "bg-primary text-white" : "hover:bg-gray-100"}`}
                  onClick={() => setActiveTab("services")}
                >
                  <Settings className="h-5 w-5" />
                  My Services
                </button>
                <button
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-left ${activeTab === "bookings" ? "bg-primary text-white" : "hover:bg-gray-100"}`}
                  onClick={() => setActiveTab("bookings")}
                >
                  <Calendar className="h-5 w-5" />
                  Bookings
                </button>
                <button
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-left ${activeTab === "profile" ? "bg-primary text-white" : "hover:bg-gray-100"}`}
                  onClick={() => setActiveTab("profile")}
                >
                  <User className="h-5 w-5" />
                  Profile
                </button>
                <button 
                  className="w-full flex items-center gap-3 px-4 py-2 rounded-md text-red-600 hover:bg-red-50 mt-8"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              </nav>
            </aside>
            
            {/* Main Content */}
            <main className="md:w-3/4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                  <TabsTrigger value="services">Services</TabsTrigger>
                  <TabsTrigger value="bookings">Bookings</TabsTrigger>
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                </TabsList>

                {/* Dashboard Tab */}
                <TabsContent value="dashboard">
                  <h1 className="text-2xl font-bold mb-6">Service Provider Dashboard</h1>
                  
                  {isLoading ? (
                    <div className="flex justify-center p-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
                      <Card className={`${isDark ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'} shadow-lg`}>
                        <CardHeader className="pb-2">
                        <CardTitle className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm font-medium`}>Total Services</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-3xl font-bold">{serviceProviderResponse?.services.length}</p>
                        </CardContent>
                      </Card>
                      <Card className={`${isDark ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'} shadow-lg`}>
                        <CardHeader className="pb-2">
                        <CardTitle className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm font-medium`}>Active Bookings</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-3xl font-bold">{bookings.filter(b => b.status === "confirmed").length}</p>
                        </CardContent>
                      </Card>
                      {/* <Card className={`${isDark ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'} shadow-lg`}>
                        <CardHeader className="pb-2">
                        <CardTitle className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm font-medium`}>This Month's Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-3xl font-bold">$2,345</p>
                        </CardContent>
                      </Card> */}
                    </div>
                  )}
                  
                  {/* Recent Activity / Upcoming Bookings */}
                  <Card className={`${isDark ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'} shadow-lg`}>
                    <CardHeader>
                      <CardTitle className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm font-medium`}>Upcoming Bookings</CardTitle>
                    </CardHeader>
                    <CardContent className={`p-6 ${isDark ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'}`}>
  {bookings.filter(booking => booking.status === "pending").length > 0 ? (
    <div className="space-y-4">
      {bookings
        .filter(booking => booking.status === "pending")
        .slice(0, 5)
        .map((booking, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-4 ${
              isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-800'
            } rounded-md`}
          >
            <div>
              <p className="font-medium">{booking.service?.name || "Service Appointment"}</p>
              <p
                className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                Customer: {booking.user?.name || "Unknown"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">
                {new Date(booking.date).toLocaleDateString()}
              </p>
              <p
                className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                {booking.timeSlot}
              </p>
            </div>
          </div>
        ))}
    </div>
  ) : (
    <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
      No pending bookings
    </p>
  )}
</CardContent>
                  </Card>
                </TabsContent>

                {/* Services Tab */}
                <TabsContent value="services">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Services</h1>
          <Button onClick={handleAddService}>Add New Service</Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : services.length > 0 ? (
          <div className="space-y-4">
            {services.map((service, index) => (
              <Card className={`${isDark ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'} shadow-lg`} key={index}>
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="p-6 md:w-3/4">
                      <h3 className="text-lg font-semibold mb-2">{service.name}</h3>
                      <p className="text-sm text-gray-600 mb-4">{service.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm mb-4">
                        <div>
                          <span className="font-medium">Price:</span> ${service.price}
                        </div>
                        <div>
                          <span className="font-medium">Duration:</span> {service.duration}
                        </div>
                        <div>
                          <span className="font-medium">Category:</span> {service.category}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditService(service)}>
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className={`text-center py-12 ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-50 text-gray-500'} rounded-lg`}>
            <Settings className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Services Listed</h3>
            <p className="text-gray-500 mb-6">You haven't added any services yet.</p>
            <Button onClick={handleAddService}>Add Your First Service</Button>
          </div>
        )}
      </TabsContent>

      {/* Add/Edit Service Modal */}
      <ServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        service={selectedService}
        serviceProviderId={serviceProviderResponse?._id}
      />
                {/* Bookings Tab */}
                <TabsContent value="bookings">
                  <h1 className="text-2xl font-bold mb-6">Manage Bookings</h1>
                  
                  {isLoading ? (
                    <div className="flex justify-center p-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                  ) : bookings.length > 0 ? (
                    <div className="space-y-4">
                      {bookings.map((booking, index) => (
                        <Card key={index}>
                          <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row justify-between">
                              <div>
                                <h3 className="font-semibold text-lg">{booking.service?.name || "Service Appointment"}</h3>
                                <p className="text-sm text-gray-500 mb-2">Customer: {booking.user?.name || "Unknown"}</p>
                                <div className="flex gap-4 text-sm">
                                  <div>
                                    <span className="font-medium">Date:</span> {new Date(booking.date).toLocaleDateString()}
                                  </div>
                                  <div>
                                    <span className="font-medium">Time:</span> {booking.timeSlot}
                                  </div>
                                </div>
                              </div>
                              <div className="mt-4 md:mt-0 md:text-right">
                                <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 ${
                                  booking.status === "confirmed" ? "bg-green-100 text-green-800" : 
                                  booking.status === "pending" ? "bg-yellow-100 text-yellow-800" : 
                                  booking.status === "completed" ? "bg-blue-100 text-blue-800" : 
                                  "bg-red-100 text-red-800"
                                }`}>
                                  {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1) || "Unknown"}
                                </div>
                                <div className="flex gap-2 justify-end">
                                <Button variant="outline" size="sm" onClick={() => handleViewDetails(booking)}>
                  View Details
                </Button>
                                  <Select
  value={booking.status}
  onValueChange={(value) => handleBookingStatusChange(booking._id, value as Booking['status'])}
><SelectTrigger className={`h-9 w-40 ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300'}`}>
    <SelectValue placeholder="Change Status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="pending">Pending</SelectItem>
    <SelectItem value="confirmed">Confirmed</SelectItem>
    <SelectItem value="completed">Completed</SelectItem>
    <SelectItem value="cancelled">Cancelled</SelectItem>
  </SelectContent>
</Select>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className={`text-center py-12 ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-50 text-gray-500'} rounded-lg`}>
                      <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Bookings Yet</h3>
                      <p className="text-gray-500">You don't have any service bookings at the moment.</p>
                    </div>
                  )}
                  <BookingDetailsModal
    isOpen={isBookingModalOpen}
    onClose={() => setIsBookingModalOpen(false)}
    booking={selectedBooking}
    
  />
                </TabsContent>

                {/* Profile Tab */}
                <TabsContent value="profile">
  <h1 className="text-2xl font-bold mb-6">My Profile</h1>

  <Card className={`${isDark ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'} shadow-lg`}>
    <CardContent className="pt-6">
      <form onSubmit={handleUpdateProfile}>
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-1/3 space-y-2">
              <label className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm font-medium`}>Full Name</label>
              <Input
  className={`${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300'}`}

                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              />
            </div>
            <div className="lg:w-1/3 space-y-2">
              <label className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm font-medium`}>Email</label>
              <Input
  className={`${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300'}`}

                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              />
            </div>
            <div className="lg:w-1/3 space-y-2">
              <label className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm font-medium`}>Phone</label>
              <Input
  className={`${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300'}`}

                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              />
            </div>
          </div>

          {/* Business Description */}
          <div className="space-y-2">
            <label className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm font-medium`}>Business Description</label>
            <Textarea
  className={`${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300'}`}

              placeholder="Describe your business and services..."
         
              value={profileData.description}
              onChange={(e) => setProfileData({ ...profileData, description: e.target.value })}
            />
          </div>

          {/* Address Section */}
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-1/2 space-y-2">
              <label className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm font-medium`}>Address</label>
              <Input
  className={`${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300'}`}

                value={profileData.location.address}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    location: { ...profileData.location, address: e.target.value },
                  })
                }
                placeholder="Street Address"
              />
            </div>
            <div className="lg:w-1/2 space-y-2">
              <label className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm font-medium`}>City</label>
              <Input
  className={`${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300'}`}

                value={profileData.location.city}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    location: { ...profileData.location, city: e.target.value },
                  })
                }
                placeholder="City"
              />
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-1/2 space-y-2">
              <label className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm font-medium`}>State</label>
              <Input
  className={`${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300'}`}

                value={profileData.location.state}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    location: { ...profileData.location, state: e.target.value },
                  })
                }
                placeholder="State"
              />
            </div>
            <div className="lg:w-1/2 space-y-2">
              <label className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm font-medium`}>Zip Code</label>
              <Input
  className={`${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300'}`}

                value={profileData.location.zipCode}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    location: { ...profileData.location, zipCode: e.target.value },
                  })
                }
                placeholder="Zip Code"
              />
            </div>
          </div>

          {/* Specialties Section */}
          <div className="space-y-2">
            <label className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm font-medium`}>Specialties</label>
            <Textarea
  className={`${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300'}`}

              placeholder="List your specialties (comma-separated)..."
          
              value={profileData.specialties.join(", ")}
              onChange={(e) =>
                setProfileData({ ...profileData, specialties: e.target.value.split(",").map((s) => s.trim()) })
              }
            />
          </div>

          {/* Website Section */}
          <div className="space-y-2">
            <label className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm font-medium`}>Website</label>
            <Input
  className={`${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300'}`}

              value={profileData.website}
              onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
              placeholder="Website URL"
            />
          </div>

          {/* Save Changes Button */}
          <div className="pt-4">
            <Button type="submit">Save Changes</Button>
          </div>
        </div>
      </form>
    </CardContent>
  </Card>
</TabsContent>
              </Tabs>
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ServiceProviderDashboard;

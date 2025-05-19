import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { 
  ChevronDown, ChevronUp, FileText, FileImage, Clock, 
  ArrowLeft, Check, X, AlertCircle
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";

interface DocumentPreview {
  isOpen: boolean;
  url: string;
  type: "image" | "pdf";
}

const CarDetailsAdmin: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const { toast } = useToast();
  
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("active");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    details: true,
    documents: false,
    activityLog: false
  });
  const [documentPreview, setDocumentPreview] = useState<DocumentPreview>({
    isOpen: false,
    url: "",
    type: "image"
  });

  // Check admin access
  useEffect(() => {
    if (isAuthenticated && user?.role !== "admin") {
      toast({
        title: "Access Denied",
        description: "You don't have permission to view this page",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [isAuthenticated, user, navigate, toast]);

  // Fetch car details
  useEffect(() => {
    const fetchCarDetails = async () => {
      if (!id) return;
      
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");
        
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/cars/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        if (response.data.success) {
          setCar(response.data.data);
        } else {
          setError("Failed to fetch car details");
        }
      } catch (err) {
        console.error("Error fetching car details:", err);
        setError("An error occurred while fetching car details");
      } finally {
        setLoading(false);
      }
    };

    fetchCarDetails();
  }, [id]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleUpdateStatus = async () => {
    if (isUpdatingStatus) return;
    
    try {
      setIsUpdatingStatus(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");
      
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/cars/${id}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setCar(prev => ({
          ...prev,
          status: newStatus
        }));
        
        toast({
          title: "Status Updated",
          description: `Car status has been updated to ${newStatus}`,
        });
        
        setIsStatusDialogOpen(false);
      }
    } catch (err) {
      console.error("Error updating car status:", err);
      toast({
        title: "Update Failed",
        description: "Failed to update car status",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (isDark) {
      switch (status) {
        case "active":
          return "bg-green-900 text-green-300";
        case "sold":
          return "bg-blue-900 text-blue-300";
        case "pending":
          return "bg-yellow-900 text-yellow-300";
        case "draft":
          return "bg-gray-800 text-gray-300";
        default:
          return "bg-gray-800 text-gray-300";
      }
    } else {
      switch (status) {
        case "active":
          return "bg-green-100 text-green-800";
        case "sold":
          return "bg-blue-100 text-blue-800";
        case "pending":
          return "bg-yellow-100 text-yellow-800";
        case "draft":
          return "bg-gray-100 text-gray-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Check className="h-4 w-4" />;
      case "sold":
        return <Check className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "draft":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const openDocumentPreview = (url: string, type: "image" | "pdf") => {
    setDocumentPreview({
      isOpen: true,
      url,
      type
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Mock activity logs (in a real app, this would come from the backend)
  const activityLogs = [
    { action: "Car listing created", timestamp: car?.createdAt || new Date().toISOString(), user: car?.seller?.name || "Unknown" },
    { action: `Status changed to ${car?.status}`, timestamp: car?.updatedAt || new Date().toISOString(), user: "Admin" }
  ];

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="pt-24 pb-16 min-h-screen">
          <div className="container mx-auto px-4">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !car) {
    return (
      <>
        <Navbar />
        <main className="pt-24 pb-16 min-h-screen">
          <div className="container mx-auto px-4">
            <div className="bg-destructive/10 p-4 rounded-md">
              <h2 className="text-destructive font-medium">Error</h2>
              <p>{error || "Car not found"}</p>
              <Button asChild className="mt-4">
                <Link to="/admin-dashboard">Back to Dashboard</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin: Car Details | WheelsTrust</title>
      </Helmet>
      <Navbar />
      <main className={`pt-24 pb-16 ${isDark ? 'bg-gray-900 text-white' : 'bg-white'}`}>
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              className={`mb-4 ${isDark ? 'text-white hover:bg-gray-800' : ''}`}
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h1 className="text-3xl font-bold">{car.title}</h1>
              <div className="flex items-center">
                <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(car.status)}`}>
                  {getStatusIcon(car.status)}
                  {car.status.charAt(0).toUpperCase() + car.status.slice(1)}
                </div>
                <Button 
                  variant="outline" 
                  className={`ml-3 ${isDark ? 'border-gray-700 hover:bg-gray-800' : ''}`}
                  onClick={() => {
                    setNewStatus(car.status);
                    setIsStatusDialogOpen(true);
                  }}
                >
                  Change Status
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main car images */}
            <div className="lg:col-span-2">
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg overflow-hidden`}>
                {car.images && car.images.length > 0 ? (
                  <div className={`relative pb-[56.25%] ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <img 
                      src={car.images[0].url} 
                      alt={car.title} 
                      className="absolute top-0 left-0 w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className={`relative pb-[56.25%] ${isDark ? 'bg-gray-700' : 'bg-gray-100'} flex justify-center items-center`}>
                    <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>No image available</p>
                  </div>
                )}

                {/* Thumbnail gallery */}
                {car.images && car.images.length > 1 && (
                  <div className={`flex gap-2 p-3 overflow-x-auto ${isDark ? 'bg-gray-900' : ''}`}>
                    {car.images.map((image: any, index: number) => (
                      <div 
                        key={index}
                        className={`w-20 h-14 flex-shrink-0 rounded-md overflow-hidden border-2 ${
                          isDark ? 'border-gray-700 hover:border-gray-500' : 'border-transparent hover:border-primary'
                        } cursor-pointer`}
                      >
                        <img 
                          src={image.url} 
                          alt={`${car.title} ${index + 1}`} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Car details section */}
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg mt-6`}>
                <div 
                  className={`flex justify-between items-center p-4 cursor-pointer ${
                    isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => toggleSection("details")}
                >
                  <h2 className="text-xl font-semibold">Car Details</h2>
                  {expandedSections.details ? (
                    <ChevronUp className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  ) : (
                    <ChevronDown className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  )}
                </div>
                {expandedSections.details && (
                  <div className={`p-4 ${isDark ? 'border-t border-gray-700' : 'border-t'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-medium text-gray-500">Basic Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Make</p>
                            <p>{car.make}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Model</p>
                            <p>{car.model}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Year</p>
                            <p>{car.year}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Price</p>
                            <p className="font-semibold">₹{car.price}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Condition</p>
                            <p>{car.condition}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Mileage</p>
                            <p>{car.mileage}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Location</p>
                            <p>{car.location}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-medium text-gray-500">Additional Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Exterior Color</p>
                            <p>{car.exteriorColor || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Interior Color</p>
                            <p>{car.interiorColor || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Transmission</p>
                            <p>{car.transmission || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Fuel Type</p>
                            <p>{car.fuelType || "N/A"}</p>
                          </div>
                        </div>

                        <h3 className="font-medium text-gray-500">Description</h3>
                        <p className="text-gray-700">{car.description}</p>

                        {car.features && car.features.length > 0 && (
                          <>
                            <h3 className="font-medium text-gray-500">Features</h3>
                            <ul className="grid grid-cols-2 gap-2">
                              {car.features.map((feature: string, index: number) => (
                                <li key={index} className="flex items-center">
                                  <Check className="h-4 w-4 text-primary mr-2" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Documents section */}
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg mt-6`}>
                <div 
                  className={`flex justify-between items-center p-4 cursor-pointer ${
                    isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => toggleSection("documents")}
                >
                  <h2 className="text-xl font-semibold">Car Documents</h2>
                  {expandedSections.documents ? (
                    <ChevronUp className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  ) : (
                    <ChevronDown className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  )}
                </div>
                {expandedSections.documents && (
                  <div className={`p-4 ${isDark ? 'border-t border-gray-700' : 'border-t'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="border rounded-lg p-3">
                        <h3 className="font-medium mb-2">RC Document</h3>
                        {car.rcDocument?.url ? (
                          <div className="bg-gray-100 p-4 rounded-lg flex flex-col items-center justify-center">
                            {car.rcDocument.url.endsWith('.pdf') ? (
                              <FileText className="h-10 w-10 text-red-500 mb-2" />
                            ) : (
                              <FileImage className="h-10 w-10 text-blue-500 mb-2" />
                            )}
                            <Button 
                              variant="outline" 
                              className="mt-2"
                              onClick={() => openDocumentPreview(
                                car.rcDocument.url, 
                                car.rcDocument.url.endsWith('.pdf') ? 'pdf' : 'image'
                              )}
                            >
                              View Document
                            </Button>
                          </div>
                        ) : (
                          <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-center h-32">
                            <p className="text-gray-500">No document available</p>
                          </div>
                        )}
                      </div>

                      <div className="border rounded-lg p-3">
                        <h3 className="font-medium mb-2">Insurance Document</h3>
                        {car.insuranceDocument?.url ? (
                          <div className="bg-gray-100 p-4 rounded-lg flex flex-col items-center justify-center">
                            {car.insuranceDocument.url.endsWith('.pdf') ? (
                              <FileText className="h-10 w-10 text-red-500 mb-2" />
                            ) : (
                              <FileImage className="h-10 w-10 text-blue-500 mb-2" />
                            )}
                            <Button 
                              variant="outline" 
                              className="mt-2"
                              onClick={() => openDocumentPreview(
                                car.insuranceDocument.url, 
                                car.insuranceDocument.url.endsWith('.pdf') ? 'pdf' : 'image'
                              )}
                            >
                              View Document
                            </Button>
                          </div>
                        ) : (
                          <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-center h-32">
                            <p className="text-gray-500">No document available</p>
                          </div>
                        )}
                      </div>

                      <div className="border rounded-lg p-3">
                        <h3 className="font-medium mb-2">PUC Document</h3>
                        {car.pucDocument?.url ? (
                          <div className="bg-gray-100 p-4 rounded-lg flex flex-col items-center justify-center">
                            {car.pucDocument.url.endsWith('.pdf') ? (
                              <FileText className="h-10 w-10 text-red-500 mb-2" />
                            ) : (
                              <FileImage className="h-10 w-10 text-blue-500 mb-2" />
                            )}
                            <Button 
                              variant="outline" 
                              className="mt-2"
                              onClick={() => openDocumentPreview(
                                car.pucDocument.url, 
                                car.pucDocument.url.endsWith('.pdf') ? 'pdf' : 'image'
                              )}
                            >
                              View Document
                            </Button>
                          </div>
                        ) : (
                          <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-center h-32">
                            <p className="text-gray-500">No document available</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Activity log section */}
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg mt-6`}>
                <div 
                  className={`flex justify-between items-center p-4 cursor-pointer ${
                    isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => toggleSection("activityLog")}
                >
                  <h2 className="text-xl font-semibold">Activity Log</h2>
                  {expandedSections.activityLog ? (
                    <ChevronUp className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  ) : (
                    <ChevronDown className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  )}
                </div>
                {expandedSections.activityLog && (
                  <div className={`p-4 ${isDark ? 'border-t border-gray-700' : 'border-t'}`}>
                    <ul className="space-y-4">
                      {activityLogs.map((log, index) => (
                        <li key={index} className="flex items-start">
                          <div className={`mr-3 mt-1 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-full p-1`}>
                            <Clock className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          </div>
                          <div>
                            <p className="font-medium">{log.action}</p>
                            <div className={`flex items-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              <span className="mr-2">{formatDate(log.timestamp)}</span>
                              <span className="mr-1">•</span>
                              <span>by {log.user}</span>
                            </div>
                          </div>
                          <div className={`ml-auto text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg p-4`}>
                <h3 className="text-lg font-medium mb-4">Seller Information</h3>
                {car.seller ? (
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className={`w-12 h-12 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full flex items-center justify-center mr-3`}>
                        {car.seller.name ? car.seller.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div>
                        <p className="font-medium">{car.seller.name}</p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Seller</p>
                      </div>
                    </div>
                    <div className="text-sm">
                      <p className="flex items-center mb-2">
                        <span className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} p-1 rounded-full mr-2`}>
                          <svg className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                          </svg>
                        </span>
                        {car.seller.phone || "No phone provided"}
                      </p>
                      <p className="flex items-center">
                        <span className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} p-1 rounded-full mr-2`}>
                          <svg className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                          </svg>
                        </span>
                        {car.seller.email || "No email provided"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Seller information not available</p>
                )}
              </div>

              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg p-4 mt-6`}>
                <h3 className="text-lg font-medium mb-4">Listing Information</h3>
                <ul className="space-y-3">
                  <li className="flex justify-between text-sm">
                    <span className="text-gray-500">Listed On</span>
                    <span>{formatDate(car.createdAt)}</span>
                  </li>
                  <li className="flex justify-between text-sm">
                    <span className="text-gray-500">Last Updated</span>
                    <span>{formatDate(car.updatedAt)}</span>
                  </li>
                  <li className="flex justify-between text-sm">
                    <span className="text-gray-500">Listing ID</span>
                    <span className="font-mono">{car._id}</span>
                  </li>
                </ul>
              </div>

              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg p-4 mt-6`}>
                <h3 className="text-lg font-medium mb-4">Actions</h3>
                <div className="space-y-3">
                  <Button className="w-full" onClick={() => setIsStatusDialogOpen(true)}>
                    Change Status
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to={`/admin-dashboard`}>
                      Back to Dashboard
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Status change dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className={`${isDark ? 'bg-gray-800 text-white' : 'bg-white'}`}>
          <DialogHeader>
            <DialogTitle>Update Car Status</DialogTitle>
            <DialogDescription className={isDark ? 'text-gray-400' : ''}>
              Change the status of this car listing.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select defaultValue={car.status} onValueChange={setNewStatus}>
              <SelectTrigger className={isDark ? 'border-gray-700' : ''}>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className={isDark ? 'bg-gray-800 border-gray-700' : ''}>
                <SelectItem value="active" className={`flex items-center gap-2 ${isDark ? 'hover:bg-gray-700' : ''}`}>
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Active</span>
                </SelectItem>
                <SelectItem value="sold" className={`flex items-center gap-2 ${isDark ? 'hover:bg-gray-700' : ''}`}>
                  <Check className="h-4 w-4 text-blue-500" />
                  <span>Sold</span>
                </SelectItem>
                <SelectItem value="pending" className={`flex items-center gap-2 ${isDark ? 'hover:bg-gray-700' : ''}`}>
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span>Pending</span>
                </SelectItem>
                <SelectItem value="draft" className={`flex items-center gap-2 ${isDark ? 'hover:bg-gray-700' : ''}`}>
                  <AlertCircle className="h-4 w-4 text-gray-500" />
                  <span>Draft</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsStatusDialogOpen(false)}
              className={isDark ? 'border-gray-700 hover:bg-gray-700' : ''}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} disabled={isUpdatingStatus}>
              {isUpdatingStatus ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document preview dialog */}
      <Dialog open={documentPreview.isOpen} onOpenChange={(open) => setDocumentPreview(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className={`max-w-4xl h-auto max-h-[80vh] overflow-y-auto ${isDark ? 'bg-gray-800 text-white' : 'bg-white'}`}>
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center p-4">
            {documentPreview.type === "image" ? (
              <img src={documentPreview.url} alt="Document Preview" className="max-h-[60vh] object-contain" />
            ) : (
              <iframe src={documentPreview.url} title="PDF Preview" className="w-full h-[60vh]"></iframe>
            )}
          </div>
          <DialogFooter>
            <Button asChild>
              <a href={documentPreview.url} target="_blank" rel="noopener noreferrer">
                Open in New Tab
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </>
  );
};

export default CarDetailsAdmin;

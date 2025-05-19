import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Star, MessageSquare, Calendar as CalendarIcon, User, Check } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { AuthModalProvider } from "@/components/auth/AuthModalProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { Loader2 } from "lucide-react";
import ReviewsSection from "@/components/review/ReviewsSection";
import { useTheme } from "@/context/ThemeContext";

// Add Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Service {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
}

interface ServiceProvider {
  _id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  reviewCount: number;
  services: Service[];
  status: string;
  verified: boolean;
  gallery: string[];
  specialties: string[];
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  hours: {
    [key: string]: string;
  };
}

interface TimeSlot {
  date: string;
  time: string;
  isBooked: boolean;
}

const ServiceProviderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  // const { openAuthModal } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [bookedTimeSlots, setBookedTimeSlots] = useState<TimeSlot[]>([]);
  const { toast } = useToast();
  
  const { isDark } = useTheme();// Example variable to check if dark mode is enabled
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    const fetchProviderDetails = async () => {
      try {
        const response = await axios.get<{ success: boolean; data: ServiceProvider }>(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/service-providers/${id}`
        );
        
        if (response.data.success) {
          console.log("Fetched provider details:", response.data.data);
          setProvider(response.data.data);
          // Fetch booked time slots for today
          try {
            const today = new Date().toISOString().split('T')[0];
            const bookingsResponse = await axios.get<{ success: boolean; data: TimeSlot[] }>(
              `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/bookings/check-availability/${id}?date=${today}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`
                }
              }
            );
            if (bookingsResponse.data.success) {
              setBookedTimeSlots(bookingsResponse.data.data);
            }
          } catch (error) {
            console.error("Error fetching bookings:", error);
            // Don't show error toast for bookings fetch as it's not critical
          }
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch provider details",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching provider details:", error);
        toast({
          title: "Error",
          description: "Failed to fetch provider details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProviderDetails();
  }, [id, toast]);

  // Add Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} hr${remainingMinutes ? ` ${remainingMinutes} min` : ''}`;
  };
  // Function to fetch availability for a specific date
  const fetchAvailability = async (date: string) => {
    try {
      const formattedDate = new Date(date).toISOString().split('T')[0];
      const response = await axios.get<{ success: boolean; data: TimeSlot[] }>(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/bookings/check-availability/${id}?date=${formattedDate}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      if (response.data.success) {
        setBookedTimeSlots(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
    }
  };

  // Update availability when date changes
  useEffect(() => {
    if (selectedDate) {
      fetchAvailability(selectedDate);
    }
  }, [selectedDate]);

  const handleServiceSelect = (service: Service) => {
    setSelectedServices(prev => {
      const isSelected = prev.some(s => s._id === service._id);
      if (isSelected) {
        return prev.filter(s => s._id !== service._id);
      } else {
        return [...prev, service];
      }
    });
  };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (selectedServices.length === 0) {
      toast({
        title: "No Services Selected",
        description: "Please select at least one service to book",
        variant: "destructive",
      });
      return;
    }
    setIsBookingModalOpen(true);
  };

  const handleContactProvider = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setIsMessageModalOpen(true);
  };

  const handleBookingSubmit = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please select both a date and time.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsProcessingPayment(true);
      const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0);
      
      // Create Razorpay order
      const orderResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/payments/create-order`,
        {
          amount: totalPrice * 100, // Convert to paise
          currency: 'INR',
          serviceProviderId: id
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!orderResponse.data.success) {
        throw new Error('Failed to create payment order');
      }

      // Initialize Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: totalPrice * 100,
        currency: "INR",
        name: "WheelsTrust",
        description: `Booking services from ${provider?.name}`,
        order_id: orderResponse.data.orderId,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await axios.post(
              `${import.meta.env.VITE_API_URL}/api/v1/payments/verify`,
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                serviceProviderId: id,
        services: selectedServices.map(service => ({
          name: service.name,
          price: service.price,
          duration: service.duration
        })),
                date: new Date(selectedDate).toISOString().split('T')[0],
        time: selectedTime,
                totalPrice
              },
        {
          headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

            if (verifyResponse.data.success) {
        toast({
          title: "Booking Successful!",
          description: `Your appointment has been booked for ${selectedDate} at ${selectedTime}. Total: $${totalPrice.toFixed(2)}`,
        });
        
        // Update booked time slots
        setBookedTimeSlots(prev => [...prev, { date: selectedDate, time: selectedTime, isBooked: true }]);
        
        setIsBookingModalOpen(false);
        setSelectedDate("");
        setSelectedTime("");
        setSelectedServices([]);
      }
          } catch (error) {
            console.error("Payment verification error:", error);
            toast({
              title: "Payment Verification Failed",
              description: "There was an error verifying your payment. Please contact support.",
              variant: "destructive"
            });
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone
        },
        theme: {
          color: "#2563eb"
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Booking error:", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          navigate("/login");
          return;
        }
        if (error.response?.data?.message) {
          toast({
            title: "Booking Failed",
            description: error.response.data.message,
            variant: "destructive"
          });
          return;
        }
      }
      toast({
        title: "Booking Failed",
        description: "There was an error processing your booking. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleMessageSubmit = () => {
    if (!message.trim()) {
      toast({
        title: "Empty Message",
        description: "Please enter a message to send.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Message Sent",
      description: "Your message has been sent to the service provider.",
    });
    
    setIsMessageModalOpen(false);
    setMessage("");
  };
  const calculateEndTime = (startTime: string, duration: number): string => {
    // Parse the start time
    const [time, period] = startTime.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    // Convert to 24-hour format
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    // Add duration
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    const endDate = new Date(startDate.getTime() + duration * 60000);
    
    // Convert back to 12-hour format
    let endHours = endDate.getHours();
    const endPeriod = endHours >= 12 ? 'PM' : 'AM';
    endHours = endHours % 12;
    endHours = endHours || 12; // Convert 0 to 12
    
    return `${endHours}:${String(endDate.getMinutes()).padStart(2, '0')} ${endPeriod}`;
  };
  // Available time slots
  const availableTimeSlots = [
    "09:00 AM", "10:00 AM", "11:00 AM", 
    "12:00 PM", "01:00 PM", "02:00 PM", 
    "03:00 PM", "04:00 PM"
  ];
  
  // Available dates (next 7 days)
  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  });

  const isTimeSlotBooked = (date: string, time: string) => {
    return bookedTimeSlots.some(slot => slot.date === date && slot.time === time);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Provider not found</h2>
        <Link to="/services" className="text-primary hover:underline">
          Return to Services
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{provider?.name || "Loading..."} | WheelsTrust</title>
      </Helmet>
      
      <Navbar />
      
      <main className={`pt-24 pb-16 ${isDark ? 'bg-gray-900 text-white' : ''}`}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Image and Details */}
            <div>
              {/* Hero Section */}
              <div className="relative rounded-lg overflow-hidden shadow-xl">
              <div className="relative rounded-lg overflow-hidden shadow-xl">
  {provider?.gallery && provider.gallery.length > 0 ? (
    <>
      {/* Display the active image */}
      <img
        src={provider.gallery[activeImageIndex]}
        alt={`Gallery Image ${activeImageIndex + 1}`}
        className="w-full h-80 object-cover object-center"
      />

      {/* Navigation Buttons */}
      <button
        onClick={() =>
          setActiveImageIndex((prevIndex) =>
            prevIndex === 0 ? provider.gallery.length - 1 : prevIndex - 1
          )
        }
        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
      >
        &#8249; {/* Left Arrow */}
      </button>
      <button
        onClick={() =>
          setActiveImageIndex((prevIndex) =>
            prevIndex === provider.gallery.length - 1 ? 0 : prevIndex + 1
          )
        }
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
      >
        &#8250; {/* Right Arrow */}
      </button>

      {/* Image Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {provider.gallery.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full ${
              index === activeImageIndex ? "bg-white" : "bg-gray-400"
            }`}
          ></div>
        ))}
      </div>
    </>
  ) : (
    // Fallback if no gallery images are available
    <img
      src={provider?.image}
      alt={provider?.name}
      className="w-full h-80 object-cover object-center"
    />
  )}
</div>
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-gray-900 to-transparent p-6">
                  <h1 className="text-3xl font-bold text-white">{provider?.name}</h1>
                  <div className="flex items-center text-yellow-400 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-5 w-5 ${i < Math.floor(provider?.rating || 0) ? 'fill-yellow-400' : 'opacity-50'}`} />
                    ))}
                    <span className="text-white ml-2 text-sm">
                      {provider?.rating} ({provider?.reviewCount} reviews)
                    </span>
                  </div>
                  <p className="text-gray-300">{provider?.description}</p>
                </div>
              </div>
              
              {/* Provider Info */}
              <div className="mt-8">
                <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : ''}`}>Service Provider</h2>
                <div className={`rounded-lg shadow-md p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`text-lg font-medium ${isDark ? 'text-white' : ''}`}>{provider?.name}</h3>
                      <p className={isDark ? 'text-gray-300 mb-2' : 'text-gray-600 mb-2'}>
                        Professional auto care services since 2010.
                      </p>
                      <div className={`flex items-center ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        <MapPin className="h-4 w-4 mr-2" />
                        {provider?.location.address}, {provider?.location.city}, {provider?.location.state} {provider?.location.zipCode}
                      </div>
                      {/* <Link to="/about" className="text-primary hover:underline">
                        Learn more about {provider?.name}
                      </Link> */}
                    </div>
                    
                    
                  </div>
                </div>
              </div>
              
              {/* Reviews and Availability Tabs */}
              <div className="mt-8">
                <Tabs defaultValue="availability">
                  <TabsList className={`grid w-full grid-cols-1 ${isDark ? 'bg-gray-800' : ''}`}>
                    <TabsTrigger 
                      value="availability"
                      className={isDark ? 'data-[state=active]:bg-gray-700' : ''}
                    >Availability</TabsTrigger>
                    {/* <TabsTrigger 
                      value="reviews"
                      className={isDark ? 'data-[state=active]:bg-gray-700' : ''}
                    >Reviews</TabsTrigger> */}
                  </TabsList>
                  
                  <TabsContent value="availability" className="mt-4">
                    <div className={`rounded-lg shadow-md p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                      <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : ''}`}>Service Hours</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {provider && Object.entries(provider.hours).map(([day, hours]) => (
                          <div key={day} className={`rounded-lg p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <div className={`flex items-center ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                              <Calendar className="h-4 w-4 mr-2" />
                              <span className="font-medium">{day}</span>
                            </div>
                            <div className={`flex items-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              <Clock className="h-4 w-4 mr-2" />
                              <span>{hours}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="reviews" className="mt-4">
                    <div className={`rounded-lg shadow-md p-0 overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                      {/* Show a few preview reviews in the tab */}
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className={`text-lg font-medium ${isDark ? 'text-white' : ''}`}>Recent Reviews</h3>
                          <div className="flex items-center">
                            <div className="flex items-center text-yellow-400 mr-2">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-4 w-4 ${i < Math.floor(provider?.rating || 0) ? '' : 'opacity-50'}`} />
                              ))}
                            </div>
                            <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                              {provider?.rating} ({provider?.reviewCount} reviews)
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-6">
                          {/* Sample reviews */}
                          <div className={`border-b pb-4 ${isDark ? 'border-gray-700' : ''}`}>
                            <div className="flex items-center mb-2">
                              <div className={`w-10 h-10 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} mr-3 flex items-center justify-center`}>
                                <User className={`h-6 w-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                              </div>
                              <div>
                                <div className={`font-medium ${isDark ? 'text-white' : ''}`}>John D.</div>
                                <div className={isDark ? 'text-gray-400 text-xs' : 'text-gray-500 text-xs'}>1 week ago</div>
                              </div>
                            </div>
                            <div className="flex items-center text-yellow-400 mb-2">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-3 w-3 ${i < 5 ? 'fill-yellow-400' : 'opacity-50'}`} />
                              ))}
                            </div>
                            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              Excellent service! My car looks brand new after the detailing. The team was very professional and thorough.
                            </p>
                          </div>
                          
                          <div className={`pb-4 ${isDark ? 'border-gray-700' : ''}`}>
                            <div className="flex items-center mb-2">
                              <div className={`w-10 h-10 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} mr-3 flex items-center justify-center`}>
                                <User className={`h-6 w-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                              </div>
                              <div>
                                <div className={`font-medium ${isDark ? 'text-white' : ''}`}>Sarah M.</div>
                                <div className={isDark ? 'text-gray-400 text-xs' : 'text-gray-500 text-xs'}>2 weeks ago</div>
                              </div>
                            </div>
                            <div className="flex items-center text-yellow-400 mb-2">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-3 w-3 ${i < 4 ? 'fill-yellow-400' : 'opacity-50'}`} />
                              ))}
                            </div>
                            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              Good service overall. They took great care of the interior, though I would have liked a bit more attention to the wheels.
                            </p>
                          </div>
                          
                          <Button 
                            variant="outline" 
                            className={`w-full ${isDark ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : ''}`}
                          >
                            View All {provider?.reviewCount} Reviews
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Right Column - Services Selection */}
            <div>
              <div className="sticky top-24">
                <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : ''}`}>Available Services</h2>
                <div className="space-y-4">
  {provider?.services.map((service) => (
    <div
      key={service._id}
      className={`rounded-lg shadow-md p-6 cursor-pointer transition-all ${
        selectedServices.some((s) => s._id === service._id)
          ? 'ring-2 ring-primary'
          : 'hover:shadow-lg'
      } ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white text-gray-800'}`}
      onClick={() => handleServiceSelect(service)}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{service.name}</h3>
          <p className="text-sm">{service.description}</p>
        </div>
        {selectedServices.some((s) => s._id === service._id) && (
          <Check className="h-5 w-5 text-primary" />
        )}
      </div>
      <div className="flex justify-between items-center">
        <div className="text-2xl font-bold text-primary">
          ${service.price.toFixed(2)}
        </div>
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          {service.duration}
        </div>
      </div>
    </div>
  ))}
</div>

                {/* Booking Summary */}
                {selectedServices.length > 0 && (
                  <div className="mt-8">
                    <div className={`rounded-lg shadow-md p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                      <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : ''}`}>Selected Services</h2>
                      <div className="space-y-4 mb-6">
                        {selectedServices.map((service) => (
                          <div key={service._id} className="flex justify-between items-center">
                            <div>
                              <h3 className={`font-medium ${isDark ? 'text-white' : ''}`}>{service.name}</h3>
                              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{service.duration}</p>
                            </div>
                            <div className="text-primary font-semibold">
                              ${service.price.toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center mb-6">
                        <span className={`text-lg font-semibold ${isDark ? 'text-white' : ''}`}>Total</span>
                        <span className="text-2xl font-bold text-primary">
                          ${selectedServices.reduce((sum, service) => sum + service.price, 0).toFixed(2)}
                        </span>
                      </div>
                      <Button 
                        className="w-full hover:scale-105 transition-all duration-300 hover:shadow-glow"
                        onClick={handleBookNow}
                      >
                        Book Selected Services
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Reviews Section */}
          <div className="mt-12">
            <ReviewsSection 
              entityId={id || ''}
              entityType="serviceProvider"
              initialRating={provider?.rating || 4.5}
              initialReviewCount={provider?.reviewCount || 3}
            />
          </div>
        </div>
      </main>
      <Footer />
      
      {/* Booking Modal and Message Modal */}
      <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book Appointment</DialogTitle>
            <DialogDescription>
              Select a date and time for your services
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Select Date</label>
              <div className="grid grid-cols-3 gap-2">
                {availableDates.map((date, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedDate(date)}
                    className={`p-2 text-sm rounded-md border ${
                      selectedDate === date 
                        ? 'border-primary bg-primary/10' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {date}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Select Time</label>
              <div className="grid grid-cols-4 gap-2">
                {availableTimeSlots.map((time, index) => {
                  const isBooked = selectedDate ? isTimeSlotBooked(selectedDate, time) : false;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => !isBooked && setSelectedTime(time)}
                      disabled={isBooked}
                      className={`p-2 text-sm rounded-md border ${
                        selectedTime === time 
                          ? 'border-primary bg-primary/10' 
                          : isBooked
                            ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {time}
                      {isBooked && <span className="text-xs block text-gray-500">Booked</span>}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="space-y-2">
                {selectedServices.map((service) => (
                  <div key={service._id} className="flex justify-between">
                    <span className="text-gray-600">{service.name}</span>
                    <span className="font-medium">${service.price.toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-medium pt-2 border-t">
                  <span>Total</span>
                  <span className="text-primary">
                    ${selectedServices.reduce((sum, service) => sum + service.price, 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleBookingSubmit}
              disabled={isProcessingPayment}
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Booking'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* <Dialog open={isMessageModalOpen} onOpenChange={setIsMessageModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Service Provider</DialogTitle>
            <DialogDescription>
              Send a message to {provider?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Your Message</label>
              <textarea 
                className="w-full border border-gray-300 rounded-md p-2 min-h-[120px]"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message here..."
              />
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleMessageSubmit}>Send Message</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}
    </>
  );
};

export default ServiceProviderDetails;

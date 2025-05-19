
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Car, MapPin, Calendar, Heart, Share, User, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";

interface CarCardProps {
  car: {
    _id: string;
    title: string;
    price: number;
    year: number;
    mileage: number;
    location: string;
    images: {
      url: string,
      publicId: string
    }[];
    condition: string;
    fuel?: string;
    transmission?: string;
    sellerName?: string;
    sellerType?: string;
    featured?: boolean;
  };
  variant?: "compact" | "full";
}

const CarCard: React.FC<CarCardProps> = ({ car, variant = "full" }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");

  const handleTestDrive = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setIsDialogOpen(true);
  };

  const handleTestDriveSubmit = () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Missing information",
        description: "Please select both a date and time for your test drive.",
        variant: "destructive",
      });
      return;
    }

    setIsDialogOpen(false);
    
    toast({
      title: "Test Drive Scheduled",
      description: `Your test drive for ${car.year} ${car.title} is scheduled for ${format(selectedDate, 'PPP')} at ${selectedTime}.`,
    });
  };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // toast({
    //   title: "Booking Confirmed",
    //   description: `Your booking request for ${car.year} ${car.title} has been submitted.`,
    // });

    navigate(`/cars/details/${car._id}`);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === car.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === 0 ? car.images.length - 1 : prev - 1
    );
  };

  const availableTimes = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", 
    "11:00 AM", "11:30 AM", "1:00 PM", "1:30 PM", 
    "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM"
  ];

  const isCompact = variant === "compact";

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    hover: { 
      y: -5, 
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  const imageVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.4 } },
    exit: { scale: 0.9, opacity: 0, transition: { duration: 0.2 } }
  };

  return (
    <>
      <motion.div
        initial="hidden"
        animate="visible"
        whileHover="hover"
        variants={cardVariants}
      >
        <Card className={`overflow-hidden h-full flex flex-col ${car.featured ? "ring-2 ring-primary" : ""}`}>
          <div className="relative">
            <Link to={`/cars/details/${car._id}`} className="block">
              <motion.div 
                className="relative w-full overflow-hidden"
                key={currentImageIndex} // Force animation on image change
                variants={imageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <img
                  src={car.images[currentImageIndex].url}
                  alt={car.title}
                  className={`w-full ${isCompact ? "h-40" : "h-52 md:h-64"} object-cover`}
                />
              </motion.div>
              
              {car.images.length > 1 && (
                <>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute left-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/30 hover:bg-black/50 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="h-5 w-5 text-white" />
                      <span className="sr-only">Previous image</span>
                    </Button>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/30 hover:bg-black/50 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-5 w-5 text-white" />
                      <span className="sr-only">Next image</span>
                    </Button>
                  </motion.div>
                </>
              )}
            </Link>
            
            {car.featured && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
                  Featured
                </Badge>
              </motion.div>
            )}
            
            <div className="absolute top-2 right-2 flex gap-2">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 rounded-full bg-white/80 hover:bg-white dark:bg-black/50 dark:hover:bg-black/70"
                >
                  <Heart className="h-4 w-4" />
                  <span className="sr-only">Add to favorites</span>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 rounded-full bg-white/80 hover:bg-white dark:bg-black/50 dark:hover:bg-black/70"
                >
                  <Share className="h-4 w-4" />
                  <span className="sr-only">Share</span>
                </Button>
              </motion.div>
            </div>
            
            {car.images.length > 1 && (
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                {car.images.map((_, index) => (
                  <motion.span
                    key={index}
                    initial={{ width: currentImageIndex === index ? "0.75rem" : "0.375rem" }}
                    animate={{ 
                      width: currentImageIndex === index ? "0.75rem" : "0.375rem",
                      backgroundColor: currentImageIndex === index ? "rgba(255, 255, 255, 1)" : "rgba(255, 255, 255, 0.6)"
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300`}
                  />
                ))}
              </div>
            )}
          </div>

          <CardContent className={`${isCompact ? "p-3" : "p-5"} flex-grow flex flex-col`}>
            <div className="space-y-3 flex-grow">
              <div className="flex justify-between">
                <motion.h3 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className={`${isCompact ? "text-base" : "text-lg"} font-semibold`}
                >
                  <Link to={`/cars/details/${car._id}`}>{car.title}</Link>
                </motion.h3>
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="font-bold text-primary"
                >
                 
                 ₹{car.price.toLocaleString()}
                </motion.span>
              </div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-y-2 text-sm text-muted-foreground"
              >
                <div className="flex items-center w-1/2">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{car.year}</span>
                </div>
                <div className="flex items-center w-1/2">
                  <Car className="h-4 w-4 mr-1" />
                  <span>{car.mileage.toLocaleString()} mi</span>
                </div>
                {!isCompact && (
                  <>
                    <div className="flex items-center w-1/2">
                      <span className="bg-muted text-foreground text-xs px-2 py-0.5 rounded">
                        {car.condition}
                      </span>
                    </div>
                    <div className="flex items-center w-1/2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{car.location}</span>
                    </div>
                  </>
                )}
              </motion.div>

              {!isCompact && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-wrap gap-2 pt-2"
                >
                  {car.fuel && (
                    <Badge variant="outline">{car.fuel}</Badge>
                  )}
                  {car.transmission && (
                    <Badge variant="outline">{car.transmission}</Badge>
                  )}
                </motion.div>
              )}

              {!isCompact && car.sellerName && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center pt-2 text-sm text-muted-foreground"
                >
                  <User className="h-4 w-4 mr-1" />
                  <span>
                    {car.sellerName} • {car.sellerType}
                  </span>
                </motion.div>
              )}
            </div>

            {!isCompact && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex gap-2 pt-3 mt-auto"
              >
                <motion.div 
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1"
                >
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={handleBookNow}
                  >
                    View Details
                  </Button>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1"
                >
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleTestDrive}
                  >
                    <Car className="h-4 w-4 mr-2" />
                    Test Drive
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule a Test Drive</DialogTitle>
            <DialogDescription>
              Select your preferred date and time to test drive this {car.year} {car.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Select Date</Label>
              <div className="border rounded-md p-4">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="pointer-events-auto"
                  disabled={(date) => 
                    date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                    date > new Date(new Date().setMonth(new Date().getMonth() + 2))
                  }
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="time">Select Time</Label>
              <Select onValueChange={setSelectedTime}>
                <SelectTrigger id="time">
                  <SelectValue placeholder="Select a time" />
                </SelectTrigger>
                <SelectContent>
                  {availableTimes.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleTestDriveSubmit}>
              Schedule Test Drive
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CarCard;

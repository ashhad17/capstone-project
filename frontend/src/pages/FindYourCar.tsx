import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, Car } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import axios from "axios";
import { useTheme } from "@/context/ThemeContext";
import { motion } from "framer-motion";

interface Question {
  id: string;
  question: string;
  type: "single" | "multiple" | "slider";
  options?: Option[];
  min?: number;
  max?: number;
  step?: number;
}

interface Option {
  id: string;
  label: string;
  value: string;
}

interface CarRecommendation {
  _id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  condition: "new" | "used" | "certified";
  status: "active" | "sold" | "pending" | "draft";
  images:
  {
    url: string;
    publicId:string;
  };
  match: number;
  description: string;
  features: string[];
  fuelType: string;
  transmission: string;
  bodyType: string;
  exteriorColor: string;
  seller: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    location: string;


  };
  totalDriven:string;
  createdAt: string;
}

const questions: Question[] = [
  {
    id: "make",
    question: "What car make are you interested in?",
    type: "single",
    options: [
      { id: "toyota", label: "Toyota", value: "Toyota" },
      { id: "honda", label: "Honda", value: "Honda" },
      { id: "ford", label: "Ford", value: "Ford" },
      { id: "chevrolet", label: "Chevrolet", value: "Chevrolet" },
      { id: "bmw", label: "BMW", value: "BMW" },
      { id: "mercedes", label: "Mercedes-Benz", value: "Mercedes-Benz" },
      { id: "audi", label: "Audi", value: "Audi" },
      { id: "nissan", label: "Nissan", value: "Nissan" },
      { id: "hyundai", label: "Hyundai", value: "Hyundai" },
      { id: "kia", label: "Kia", value: "Kia" }
    ]
  },
  {
    id: "budget",
    question: "What's your budget range?",
    type: "slider",
    min: 100000,
    max: 5000000,
    step: 10000
  },
  {
    id: "year",
    question: "What year range are you looking for?",
    type: "slider",
    min: 2000,
    max: 2024,
    step: 1
  },
  {
    id: "totalDriven",
    question: "Maximum kilometers driven?",
    type: "slider",
    min: 0,
    max: 200000,
    step: 5000
  },
  {
    id: "fuelType",
    question: "What type of fuel do you prefer?",
    type: "single",
    options: [
      { id: "gasoline", label: "Gasoline", value: "Gasoline" },
      { id: "diesel", label: "Diesel", value: "Diesel" },
      { id: "hybrid", label: "Hybrid", value: "Hybrid" },
      { id: "electric", label: "Electric", value: "Electric" }
    ]
  },
  {
    id: "transmission",
    question: "What type of transmission do you prefer?",
    type: "single",
    options: [
      { id: "automatic", label: "Automatic", value: "Automatic" },
      { id: "manual", label: "Manual", value: "Manual" },
      { id: "cvt", label: "CVT", value: "CVT" }
    ]
  },
  {
    id: "bodyType",
    question: "What type of car body style do you prefer?",
    type: "single",
    options: [
      { id: "sedan", label: "Sedan", value: "Sedan" },
      { id: "suv", label: "SUV", value: "SUV" },
      { id: "hatchback", label: "Hatchback", value: "Hatchback" },
      { id: "truck", label: "Truck", value: "Truck" },
      { id: "coupe", label: "Coupe", value: "Coupe" },
      { id: "convertible", label: "Convertible", value: "Convertible" },
      { id: "wagon", label: "Wagon", value: "Wagon" },
      { id: "van", label: "Van", value: "Van" }
    ]
  },
  {
    id: "condition",
    question: "What condition are you looking for?",
    type: "single",
    options: [
      { id: "excellent", label: "Excellent", value: "Excellent" },
      { id: "good", label: "Good", value: "Good" },
      { id: "fair", label: "Fair", value: "Fair" },
      { id: "poor", label: "Poor", value: "Poor" }
    ]
  },
  {
    id: "features",
    question: "Which features are most important to you?",
    type: "multiple",
    options: [
      { id: "bluetooth", label: "Bluetooth", value: "Bluetooth" },
      { id: "backupCamera", label: "Backup Camera", value: "Backup Camera" },
      { id: "navigation", label: "Navigation", value: "Navigation" },
      { id: "heatedSeats", label: "Heated Seats", value: "Heated Seats" },
      { id: "sunroof", label: "Sunroof", value: "Sunroof" },
      { id: "leatherSeats", label: "Leather Seats", value: "Leather Seats" },
      { id: "appleCarPlay", label: "Apple CarPlay", value: "Apple CarPlay" },
      { id: "androidAuto", label: "Android Auto", value: "Android Auto" },
      { id: "blindSpotMonitor", label: "Blind Spot Monitor", value: "Blind Spot Monitor" },
      { id: "laneDepartureWarning", label: "Lane Departure Warning", value: "Lane Departure Warning" },
      { id: "cruiseControl", label: "Cruise Control", value: "Cruise Control" },
      { id: "remoteStart", label: "Remote Start", value: "Remote Start" },
      { id: "keylessEntry", label: "Keyless Entry", value: "Keyless Entry" },
      { id: "premiumAudio", label: "Premium Audio", value: "Premium Audio" },
      { id: "thirdRowSeating", label: "Third Row Seating", value: "Third Row Seating" }
    ]
  }
];



const FindYourCar = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showResults, setShowResults] = useState(false);
  const [recommendations, setRecommendations] = useState<CarRecommendation[]>([]);
  const { toast } = useToast();
  const [cars, setCars] = useState<CarRecommendation[]>([]); // Initialize as an empty array
  const navigate = useNavigate();
  const { isDark } = useTheme();
  
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / questions.length) * 100;
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/v1/cars`
        );
        console.log("Fetched cars:", response.data.data); // Debugging log
        setCars(response.data.data); // Assuming the backend returns cars in `response.data.cars`
      } catch (error) {
        console.error("Error fetching cars:", error);
        toast({
          title: "Error",
          description: "Failed to fetch cars. Please try again later.",
          variant: "destructive",
        });
      }
    };
  
    fetchCars();
  }, []);
  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };
  
  const handleNext = () => {
    // Ensure the question is answered
    if (!answers[currentQuestion.id] && currentQuestion.type !== "slider") {
      toast({
        title: "Please answer the question",
        description: "Select an option to continue",
        variant: "destructive",
      });
      return;
    }
  
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Ensure cars are available before generating recommendations
      if (cars.length === 0) {
        toast({
          title: "No Cars Available",
          description: "Unable to generate recommendations as no cars are available.",
          variant: "destructive",
        });
        return;
      }
  
      generateRecommendations();
      setShowResults(true);
    }
  };
  
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  const generateRecommendations = () => {
    if (!cars || cars.length === 0) {
      console.error("No cars available for recommendations.");
      return;
    }
  
    // Filter cars based on user answers and calculate match percentage
    const filteredCars = cars.map((car) => {
      let matchScore = 0;
      let totalCriteria = 0;
  
      // Make match
      if (answers.make) {
        totalCriteria++;
        if (car.make === answers.make) matchScore++;
      }
  
      // Budget match (within 20% range)
      if (answers.budget) {
        totalCriteria++;
        const budget = Number(answers.budget);
        const carPrice = Number(car.price);
        if (carPrice <= budget && carPrice >= budget * 0.8) matchScore++;
      }
  
      // Year match
      if (answers.year) {
        totalCriteria++;
        const year = Number(answers.year);
        const carYear = Number(car.year);
        if (carYear >= year - 2 && carYear <= year + 2) matchScore++;
      }
  
      // Total Driven match
      if (answers.totalDriven) {
        totalCriteria++;
        const maxDriven = Number(answers.totalDriven);
        const carDriven = Number(car.totalDriven);
        if (carDriven <= maxDriven) matchScore++;
      }
  
      // Fuel Type match
      if (answers.fuelType) {
        totalCriteria++;
        if (car.fuelType === answers.fuelType) matchScore++;
      }
  
      // Transmission match
      if (answers.transmission) {
        totalCriteria++;
        if (car.transmission === answers.transmission) matchScore++;
      }
  
      // Body Type match
      if (answers.bodyType) {
        totalCriteria++;
        if (car.bodyType === answers.bodyType) matchScore++;
      }
  
      // Condition match
      if (answers.condition) {
        totalCriteria++;
        if (car.condition === answers.condition) matchScore++;
      }
  
      // Features match (partial match)
      if (answers.features && answers.features.length > 0) {
        totalCriteria++;
        const matchingFeatures = answers.features.filter(feature => 
          car.features.includes(feature)
        ).length;
        if (matchingFeatures > 0) {
          matchScore += matchingFeatures / answers.features.length;
        }
      }
  
      // Calculate match percentage
      const matchPercentage = totalCriteria > 0 
        ? Math.round((matchScore / totalCriteria) * 100)
        : 0;
  
      return {
        ...car,
        match: matchPercentage
      };
    }).filter(car => car.status === "active" && car.match > 0)
      .sort((a, b) => b.match - a.match);
  
    setRecommendations(filteredCars);
  };
  const handleViewCarDetails = (carId: string) => {
    // In a real app, navigate to the actual car details page
    navigate(`/cars/details/${carId}`);
    
    toast({
      title: "Car Selected",
      description: "Navigating to car details page",
    });
  };
  
  const handleTestDrive = (carName: string) => {
    toast({
      title: "Test Drive Requested",
      description: `We'll contact you to schedule a test drive for the ${carName}.`,
    });
  };
  
  const handleRestart = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setShowResults(false);
  };
  
  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case "single":
        return (
          <RadioGroup
            value={answers[currentQuestion.id] || ""}
            onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
            className="space-y-3"
          >
            {currentQuestion.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem 
                  value={option.value} 
                  id={option.id}
                  className={isDark ? 'border-gray-500 text-white' : ''}
                />
                <Label htmlFor={option.id} className={isDark ? 'text-white' : ''}>
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );
        
      case "multiple":
        const selectedOptions = answers[currentQuestion.id] || [];
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={option.id}
                  checked={selectedOptions.includes(option.value)}
                  onChange={(e) => {
                    const value = option.value;
                    if (e.target.checked) {
                      handleAnswerChange(
                        currentQuestion.id,
                        [...selectedOptions, value]
                      );
                    } else {
                      handleAnswerChange(
                        currentQuestion.id,
                        selectedOptions.filter((v: string) => v !== value)
                      );
                    }
                  }}
                  className={`h-4 w-4 rounded ${isDark ? 'border-gray-500 bg-gray-700 checked:bg-primary' : 'border-gray-300'}`}
                />
                <Label htmlFor={option.id} className={isDark ? 'text-white' : ''}>
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        );
        
      case "slider":
        return (
          <div className="space-y-6">
            <Slider
              defaultValue={[answers[currentQuestion.id] || currentQuestion.min || 0]}
              max={currentQuestion.max}
              min={currentQuestion.min}
              step={currentQuestion.step}
              onValueChange={(value) => handleAnswerChange(currentQuestion.id, value[0])}
              className={isDark ? 'bg-gray-700' : ''}
            />
            <div className="flex justify-between items-center">
              <span className={isDark ? 'text-gray-300' : ''}>
                ${currentQuestion.min?.toLocaleString()}
              </span>
              <span className={`font-medium ${isDark ? 'text-white' : ''}`}>
                ${(answers[currentQuestion.id] || currentQuestion.min || 0).toLocaleString()}
              </span>
              <span className={isDark ? 'text-gray-300' : ''}>
                ${currentQuestion.max?.toLocaleString()}
              </span>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-gray-900 text-white' : ''}`}>
      <Helmet>
        <title>Find Your Perfect Car | WheelsTrust</title>
        <meta name="description" content="Answer a few questions and we'll help you find the perfect car that matches your needs and preferences." />
      </Helmet>
      <Navbar />
      
      <main className={`flex-grow pt-24 pb-16 ${
        isDark 
          ? 'bg-gradient-to-b from-gray-900 to-gray-800' 
          : 'bg-gradient-to-b from-blue-50 to-white'
      }`}>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {!showResults ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className={`border shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
                  <CardHeader className="text-center">
                    <CardTitle className={`text-2xl md:text-3xl ${isDark ? 'text-white' : ''}`}>
                      Find Your Perfect Car
                    </CardTitle>
                    <CardDescription className={isDark ? 'text-gray-300' : ''}>
                      Answer a few questions to get personalized car recommendations
                    </CardDescription>
                    <Progress value={progress} className={`mt-4 ${isDark ? 'bg-gray-700' : ''}`} />
                  </CardHeader>
                  
                  <CardContent className="pt-6">
                    <div className="mb-6">
                      <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : ''}`}>
                        {currentQuestionIndex + 1}. {currentQuestion.question}
                      </h2>
                      {renderQuestion()}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={handlePrevious}
                      disabled={currentQuestionIndex === 0}
                      className={isDark ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' : ''}
                    >
                      Previous
                    </Button>
                    <Button 
                      onClick={handleNext}
                      className="hover:scale-105 transition-all duration-300 hover:shadow-glow"
                    >
                      {currentQuestionIndex === questions.length - 1 ? "Get Results" : "Next"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ) : (
              <div className="space-y-6">
                <motion.div 
                  className="text-center mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h1 className={`text-2xl md:text-3xl font-bold mb-2 ${isDark ? 'text-white' : ''}`}>Your Car Recommendations</h1>
                  <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                    Based on your preferences, here are the cars we think would be perfect for you
                  </p>
                </motion.div>
                
                <div className="space-y-6">
  {recommendations.length > 0 ? (
    recommendations.map((car, index) => (
      <motion.div
        key={car._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
      >
        <Card 
          className={`overflow-hidden border-0 shadow-lg transition-shadow hover:shadow-xl ${
            isDark 
              ? 'bg-gray-800 hover:shadow-glow-dark' 
              : 'hover:shadow-glow-light'
          }`}
        >
          <div className="md:flex">
            <div className="md:w-2/5 relative h-48 md:h-auto">
              <img
                src={car.images?.[0]?.url || "/placeholder.jpg"}
                alt={car.make+" "+car.model}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <div className="p-6 md:w-3/5">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : ''}`}>{car.make+" "+car.model}</h2>
                  <p className="text-lg font-medium text-primary mb-2">${car.price.toLocaleString()}</p>
                </div>
                <div className="bg-primary/10 text-primary rounded-full px-3 py-1 font-semibold animate-pulse">
                  {car.match || 0}% Match
                </div>
              </div>
              <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{car.description}</p>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {car.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{feature}</span>
                  </div>
                ))}
              </div>
              <div className="flex space-x-3">
                <Button 
                  onClick={() => handleViewCarDetails(car._id)} 
                  className="flex-1 hover:scale-105 transition-all duration-300 hover:shadow-glow"
                >
                  View Details
                </Button>
                <Button 
                  variant="outline" 
                  className={`flex-1 hover:scale-105 transition-all duration-300 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' : ''
                  }`} 
                  onClick={() => handleTestDrive(car.make+" "+car.model)}
                >
                  <Car className="h-4 w-4 mr-2" />
                  Test Drive
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    ))
  ) : (
    <div className={`text-center py-10 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg`}>
      <p className={isDark ? 'text-gray-300' : 'text-gray-500'}>No cars found matching your criteria</p>
    </div>
  )}
</div>
                
                <div className="flex justify-center pt-6">
                  <Button 
                    variant="outline" 
                    onClick={handleRestart}
                    className={`hover:scale-105 transition-all duration-300 ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' : ''
                    }`}
                  >
                    Start Over
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default FindYourCar;

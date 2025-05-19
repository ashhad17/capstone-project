
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import CarCard from "@/components/car/CarCard";
import { CarType } from "@/lib/data";
import axios from "axios";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

interface CarListingPreviewProps {
  cars: CarType[];
}

const CarListingPreview: React.FC<CarListingPreviewProps> = ({ cars }) => {
  const [carData, setCarData] = useState<CarType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    fetchCars();  
  }, []);
  
  const fetchCars = async () => {
    setLoading(true);
    try {
      const response = await axios.get<{
        success: boolean;
        data: any[];
      }>(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/cars`);
      
      if (response.data.success) {
        // Convert string values to numbers where necessary
        const formattedData = response.data.data.map((car: any) => ({
          ...car,
          price: Number(car.price),
          mileage: Number(car.mileage),
          year: Number(car.year), // Ensure year is converted to a number
        }));
        setCarData(formattedData);
      } else {
        setError("Failed to fetch cars");
      }
    } catch (err) {
      setError("Failed to fetch cars");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  console.log(carData);

  const previewCars = carData.slice(0, 3);

  // Define animations
  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };
  
  const headerVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5 }
    }
  };
  
  const carCardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.section 
      className="section-padding"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={sectionVariants}
    >
      <div className="container mx-auto px-4">
        <motion.div 
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
          variants={headerVariants}
        >
          <div className="mb-4 md:mb-0 flex flex-col justify-center items-start">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Featured Vehicles</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl">
              Explore our handpicked selection of certified pre-owned vehicles
              with complete history and thorough inspections.
            </p>
          </div>
          <motion.div 
            whileHover={{ scale: 1.05, x: -5 }} 
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/cars">
              <Button variant="outline" className="mt-4 md:mt-0">
                View All Listings
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <ArrowRight className="ml-2 h-4 w-4" />
                </motion.div>
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Display loading, error, or car cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <motion.div 
              className={`p-8 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
              animate={{ 
                opacity: [0.5, 1, 0.5],
                scale: [0.98, 1, 0.98]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <p className="text-center">Loading cars...</p>
            </motion.div>
          ) : error ? (
            <motion.p 
              className="text-red-500 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {error}
            </motion.p>
          ) : (
            previewCars.map((car, index) => (
              <motion.div 
                key={car._id} 
                variants={carCardVariants}
                custom={index}
                className="h-full"
              >
                <div className="h-full transform transition-all duration-300 hover:scale-[1.02]">
                  <CarCard car={car} />
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.section>
  );
};

export default CarListingPreview;

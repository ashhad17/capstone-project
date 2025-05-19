import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { CarType } from "@/lib/data";
import CarCard from "./CarCard";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

interface CarGridProps {
  cars?: CarType[]; // Make this optional so it can fetch cars internally if not provided
}

const CarGrid: React.FC<CarGridProps> = ({ cars: initialCars }) => {
  const [carData, setCarData] = useState<CarType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    make: "",
    model: "",
    year: "",
    price: 0,
    mileage: "",
    bodyType: "",
    fuelType: "",
    transmission: "",
  });
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [sortBy, setSortBy] = useState<string>("price");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { isDark } = useTheme();
  const carsPerPage = 6;

  useEffect(() => {
    // If cars are provided as props, use those instead of fetching
    if (initialCars) {
      setCarData(initialCars);
      setLoading(false);
      return;
    }

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

    fetchCars();
  }, [initialCars]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>, filterKey: string) => {
    const value = e.target.value;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterKey]: value,
    }));
    setCurrentPage(1); // Reset to the first page when filters change
  };

  const handleSortOrderChange = (value: "asc" | "desc") => {
    setSortOrder(value);
  };

  const handleSortByChange = (value: string) => {
    setSortBy(value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to the first page when search term changes
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // Scroll to top of grid when changing pages
    document.getElementById('cars-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredCars = carData.filter((car) => {
    const makeMatch =
      !filters.make || car.make.toLowerCase().includes(filters.make.toLowerCase());
    const modelMatch =
      !filters.model || car.model.toLowerCase().includes(filters.model.toLowerCase());
    const yearMatch = !filters.year || String(car.year).includes(filters.year);
    const priceMatch = !filters.price || car.price >= filters.price;
    const mileageMatch =
      !filters.mileage || String(car.mileage).includes(filters.mileage);
    const fuelTypeMatch =
      !filters.fuelType || (car.fuelType && car.fuelType.toLowerCase().includes(filters.fuelType.toLowerCase()));
    const transmissionMatch =
      !filters.transmission || (car.transmission && car.transmission.toLowerCase().includes(filters.transmission.toLowerCase()));
    const searchTermMatch =
      !searchTerm ||
      car.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.model?.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = car.status === "active"; // Only include cars with status "active"

    return (
      makeMatch &&
      modelMatch &&
      yearMatch &&
      priceMatch &&
      mileageMatch &&
      fuelTypeMatch &&
      transmissionMatch &&
      searchTermMatch &&
      statusMatch
    );
  });

  const sortedCars = [...filteredCars].sort((a, b) => {
    const order = sortOrder === "asc" ? 1 : -1;

    switch (sortBy) {
      case "price":
        return order * (Number(a.price) - Number(b.price));
      case "year":
        return order * (Number(a.year) - Number(b.year));
      case "mileage":
        return order * (Number(a.mileage) - Number(b.mileage));
      default:
        return 0;
    }
  });

  const startIndex = (currentPage - 1) * carsPerPage;
  const endIndex = startIndex + carsPerPage;
  const carsToDisplay = sortedCars.slice(startIndex, endIndex);

  const totalPages = Math.ceil(filteredCars.length / carsPerPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-glow-pulse h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-8 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <h3 className="text-xl font-bold mb-2">Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <motion.div 
          className="md:w-1/4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Create a simpler version of CarFilters integrated here */}
          <div className={`p-4 rounded-lg shadow-md transition-colors duration-300 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
            <h3 className="text-lg font-medium mb-4">Filter Cars</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="make">Make</Label>
                <Input
                  id="make"
                  value={filters.make}
                  onChange={(e) => handleFilterChange(e, "make")}
                  placeholder="Enter make..."
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={filters.model}
                  onChange={(e) => handleFilterChange(e, "model")}
                  placeholder="Enter model..."
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  value={filters.year}
                  onChange={(e) => handleFilterChange(e, "year")}
                  placeholder="Enter year..."
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  value={filters.price || ''}
                  onChange={(e) => handleFilterChange(e, "price")}
                  placeholder="Enter price..."
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </motion.div>

        <div className="md:w-3/4">
          <motion.div 
            className="flex flex-col md:flex-row md:items-center justify-between mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="w-full md:w-1/2 mb-2 md:mb-0">
              <Input
                type="text"
                placeholder="Search cars..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="shadow-sm"
              />
            </div>
            <div className="flex items-center space-x-2">
              <div>
                <Label htmlFor="sortOrder">Sort Order:</Label>
                <Select value={sortOrder} onValueChange={handleSortOrderChange}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Sort Order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="sortBy">Sort By:</Label>
                <Select value={sortBy} onValueChange={handleSortByChange}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="year">Year</SelectItem>
                    <SelectItem value="mileage">Mileage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>

          <motion.div 
            id="cars-grid"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {carsToDisplay.length > 0 ? (
              carsToDisplay.map((car) => (
                <motion.div key={car._id} variants={itemVariants}>
                  <CarCard car={car} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-3 text-center py-10">
                <p className="text-gray-500">No cars found matching your criteria</p>
              </div>
            )}
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div 
              className="flex justify-center mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="mr-2"
                variant="glow"
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    variant={currentPage === page ? "glow" : "outline"}
                    className={`mx-1 ${currentPage === page ? 'animate-glow-pulse' : ''}`}
                  >
                    {page}
                  </Button>
                )
              )}
              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-2"
                variant="glow"
              >
                Next
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarGrid;

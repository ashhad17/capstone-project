import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useTheme } from "@/context/ThemeContext";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

// Define Car type directly in this file instead of importing it
interface Car {
  _id: string;
  title: string;
  make: string;
  model: string;
  year: number | string;
  price: number | string;
  mileage: number | string;
  condition: string;
  bodyType: string;
  description: string;
  location: string;
  exteriorColor?: string;
  interiorColor?: string;
  transmission?: string;
  fuelType?: string;
  features?: string[];
  images?: { url: string; public_id: string }[];
  status: 'active' | 'sold' | 'pending' | 'draft';
  seller?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface CarFiltersProps {
  cars: Car[];
  onFilter: (filteredCars: Car[]) => void;
}

const CarFilters: React.FC<CarFiltersProps> = ({ cars, onFilter }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedBodyType, setSelectedBodyType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minYear, setMinYear] = useState('');
  const [maxYear, setMaxYear] = useState('');
  const { isDark } = useTheme();

  useEffect(() => {
    // Apply filters whenever filter criteria change
    const filteredCars = cars.filter(car => {
      // Match search term
      const matchesSearch = car.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           car.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Match selected make if any
      const matchesMake = selectedMake ? car.make === selectedMake : true;
      
      // Match selected body type if any
      const matchesBodyType = selectedBodyType ? car.bodyType === selectedBodyType : true;
      
      // Match price range
      const carPrice = Number(car.price);
      const minPriceNum = minPrice ? Number(minPrice) : 0;
      const maxPriceNum = maxPrice ? Number(maxPrice) : Infinity;
      
      const matchesMinPrice = !minPrice || carPrice >= minPriceNum;
      const matchesMaxPrice = !maxPrice || carPrice <= maxPriceNum;
      
      // Match year range
      const carYear = Number(car.year);
      const minYearNum = minYear ? Number(minYear) : 0;
      const maxYearNum = maxYear ? Number(maxYear) : Infinity;
      
      const matchesMinYear = !minYear || carYear >= minYearNum;
      const matchesMaxYear = !maxYear || carYear <= maxYearNum;
      
      return matchesSearch && matchesMake && matchesBodyType && 
             matchesMinPrice && matchesMaxPrice &&
             matchesMinYear && matchesMaxYear;
    });

    onFilter(filteredCars);
  }, [cars, searchTerm, selectedMake, selectedBodyType, minPrice, maxPrice, minYear, maxYear, onFilter]);

  // Extract unique makes and body types from the cars array
  const makes = [...new Set(cars.map(car => car.make))];
  const bodyTypes = [...new Set(cars.map(car => car.bodyType))];

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedMake('');
    setSelectedBodyType('');
    setMinPrice('');
    setMaxPrice('');
    setMinYear('');
    setMaxYear('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`p-6 rounded-lg shadow-md mb-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : ''}`}>Filter Cars</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className={`flex items-center gap-2 hover:scale-105 transition-all duration-300 ${
            isDark ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' : ''
          }`}
        >
          <Filter className="h-4 w-4" />
          Clear
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Search Filter */}
        <div>
          <Label htmlFor="search" className={isDark ? 'text-gray-200' : ''}>Search</Label>
          <Input
            type="text"
            id="search"
            placeholder="Search by make, model, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={isDark ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : ''}
          />
        </div>

        {/* Make Filter */}
        <div>
          <Label htmlFor="make" className={isDark ? 'text-gray-200' : ''}>Make</Label>
          <Select onValueChange={setSelectedMake} value={selectedMake}>
            <SelectTrigger className={`w-full ${isDark ? 'bg-gray-700 border-gray-600 text-white' : ''}`}>
              <SelectValue placeholder="All Makes" />
            </SelectTrigger>
            <SelectContent className={isDark ? 'bg-gray-800 border-gray-700 text-white' : ''}>
              <SelectItem value="">All Makes</SelectItem>
              {makes.map(make => (
                <SelectItem key={make} value={make}>{make}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Body Type Filter */}
        <div>
          <Label htmlFor="bodyType" className={isDark ? 'text-gray-200' : ''}>Body Type</Label>
          <Select onValueChange={setSelectedBodyType} value={selectedBodyType}>
            <SelectTrigger className={`w-full ${isDark ? 'bg-gray-700 border-gray-600 text-white' : ''}`}>
              <SelectValue placeholder="All Body Types" />
            </SelectTrigger>
            <SelectContent className={isDark ? 'bg-gray-800 border-gray-700 text-white' : ''}>
              <SelectItem value="">All Body Types</SelectItem>
              {bodyTypes.map(bodyType => (
                <SelectItem key={bodyType} value={bodyType}>{bodyType}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range Filter */}
        <div className="md:col-span-2 lg:col-span-1">
          <Label className={isDark ? 'text-gray-200' : ''}>Price Range</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className={isDark ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : ''}
            />
            <Input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className={isDark ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : ''}
            />
          </div>
        </div>

        {/* Year Range Filter */}
        <div className="lg:col-span-2">
          <Label className={isDark ? 'text-gray-200' : ''}>Year Range</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min Year"
              value={minYear}
              onChange={(e) => setMinYear(e.target.value)}
              className={isDark ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : ''}
            />
            <Input
              type="number"
              placeholder="Max Year"
              value={maxYear}
              onChange={(e) => setMaxYear(e.target.value)}
              className={isDark ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : ''}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CarFilters;

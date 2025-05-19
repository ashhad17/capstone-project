
import React, { useState } from 'react';
import { useTheme } from "@/context/ThemeContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, Filter } from 'lucide-react';
import { motion } from "framer-motion";

interface ServiceFiltersProps {
  onFilterChange: (filter: string) => void;
  activeFilter: string;
}

const ServiceFilters: React.FC<ServiceFiltersProps> = ({ onFilterChange, activeFilter }) => {
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const { isDark } = useTheme();

  const handleMinPriceChange = (value: number) => {
    setMinPrice(value);
  };

  const handleMaxPriceChange = (value: number) => {
    setMaxPrice(value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClearFilters = () => {
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setSearchQuery("");
  };

  return (
    <motion.div 
      className={`p-6 rounded-lg shadow-md mb-6 ${isDark ? 'bg-gray-800 text-white' : 'bg-white'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h3 className="text-lg font-semibold mb-4">Filter Services</h3>
      
      <div className="space-y-6">
        <div>
          <Label className={`block mb-2 ${isDark ? 'text-gray-200' : ''}`}>Search Services</Label>
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
            <Input
              type="text"
              placeholder="Search by keyword..."
              value={searchQuery}
              onChange={handleSearchChange}
              className={`pl-10 ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : ''}`}
            />
          </div>
        </div>
        
        <div>
          <Label className={`block mb-2 ${isDark ? 'text-gray-200' : ''}`}>Category</Label>
          <Select 
            defaultValue={activeFilter} 
            onValueChange={onFilterChange}
            value={activeFilter}
          >
            <SelectTrigger className={isDark ? 'bg-gray-700 border-gray-600 text-white' : ''}>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className={isDark ? 'bg-gray-800 border-gray-700 text-white' : ''}>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="repair">Repair</SelectItem>
              <SelectItem value="inspection">Inspection</SelectItem>
              <SelectItem value="cleaning">Cleaning</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* ['maintenance', 'repair', 'cleaning', 'inspection', 'other'] */}
        <div>
          <div className="flex justify-between mb-2">
            <Label className={isDark ? 'text-gray-200' : ''}>Price Range</Label>
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
              {minPrice ? `$${minPrice}` : '$0'} - {maxPrice ? `$${maxPrice}` : '$500+'}
            </span>
          </div>
          <div className="pt-4">
            <div className="mb-4">
              <Label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Minimum Price</Label>
              <Slider
                defaultValue={[0]}
                max={500}
                step={10}
                value={minPrice !== undefined ? [minPrice] : undefined}
                onValueChange={(values) => handleMinPriceChange(values[0])}
                className={isDark ? 'bg-gray-700' : ''}
              />
            </div>
            <div>
              <Label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Maximum Price</Label>
              <Slider
                defaultValue={[500]}
                max={1000}
                step={10}
                value={maxPrice !== undefined ? [maxPrice] : undefined}
                onValueChange={(values) => handleMaxPriceChange(values[0])}
                className={isDark ? 'bg-gray-700' : ''}
              />
            </div>
          </div>
        </div>
        
        <div className="pt-2">
          <Button 
            onClick={handleClearFilters} 
            variant="outline" 
            className={`w-full flex items-center gap-2 hover:scale-105 transition-all duration-300 ${
              isDark ? 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600' : ''
            }`}
          >
            <Filter className="h-4 w-4" />
            Clear Filters
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ServiceFilters;

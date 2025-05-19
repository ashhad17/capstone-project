import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface CarListing {
  _id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  condition: "new" | "used" | "certified";
  status: "active" | "sold" | "pending" | "draft";
  images: string[];
  description: string;
  features: string[];
  seller: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

interface Pagination {
  total: number;
  pages: number;
  currentPage: number;
  limit: number;
}

const CarListings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [listings, setListings] = useState<CarListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    pages: 0,
    currentPage: 1,
    limit: 10
  });
  const [filters, setFilters] = useState({
    make: '',
    model: '',
    minPrice: '',
    maxPrice: '',
    minYear: '',
    maxYear: ''
  });

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get<{ 
        success: boolean; 
        data: {
          cars: CarListing[];
          pagination: Pagination;
        }
      }>(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/cars?status=active`,
        {
          params: {
            page: currentPage,
            limit: itemsPerPage,
            ...filters
          }
        }
      );

      if (response.data.success && Array.isArray(response.data.data.cars)) {
        setListings(response.data.data.cars);
        setPagination(response.data.data.pagination);
      } else {
        setError("Failed to fetch car listings");
        toast({
          title: "Error",
          description: "Failed to fetch car listings",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching car listings:", error);
      setError("Failed to fetch car listings");
      toast({
        title: "Error",
        description: "Failed to fetch car listings. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [currentPage, filters]);

  const handleViewDetails = (carId: string) => {
    if (!carId) {
      toast({
        title: "Error",
        description: "Invalid car ID",
        variant: "destructive",
      });
      return;
    }
    navigate(`/buy/cars/${carId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-destructive">{error}</p>
        <Button onClick={() => fetchListings()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((car) => (
          <div key={car._id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="relative aspect-[16/9] w-full overflow-hidden">
              {car.images && car.images.length > 0 ? (
                <img
                  src={car.images[0]}
                  alt={`${car.make} ${car.model}`}
                  className="absolute inset-0 w-full h-full object-contain object-center"
                />
              ) : (
                <div className="absolute inset-0 w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No image available</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-xl font-semibold">{car.make} {car.model}</h3>
              <p className="text-lg font-medium text-primary mt-2">
              ₹{car.price.toLocaleString()}
              </p>
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-600">
                  {car.year} • {car.mileage.toLocaleString()} miles
                </p>
                <p className="text-sm text-gray-600 capitalize">
                  {car.condition}
                </p>
              </div>
              <Button 
                className="w-full mt-4"
                onClick={() => handleViewDetails(car._id)}
              >
                View Details
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CarListings; 
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

const CarDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [car, setCar] = useState<CarListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCarDetails = async () => {
      if (!id) {
        setError("Car ID is required");
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get<{ success: boolean; data: CarListing }>(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/cars/${id}`
        );

        if (response.data.success) {
          setCar(response.data.data);
        } else {
          setError("Failed to fetch car details");
          toast({
            title: "Error",
            description: "Failed to fetch car details",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching car details:", error);
        setError("Failed to fetch car details");
        toast({
          title: "Error",
          description: "Failed to fetch car details. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCarDetails();
  }, [id, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-destructive">{error || "Car not found"}</p>
        <Button onClick={() => navigate('/buy')}>Back to Listings</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Car Images */}
        <div className="space-y-4">
          <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden">
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
          {car.images && car.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {car.images.slice(1).map((image, index) => (
                <div key={index} className="relative aspect-[4/3] rounded overflow-hidden">
                  <img
                    src={image}
                    alt={`${car.make} ${car.model} - ${index + 2}`}
                    className="absolute inset-0 w-full h-full object-contain object-center"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Car Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{car.make} {car.model}</h1>
            <p className="text-2xl font-semibold text-primary mt-2">
            ₹{car.price.toLocaleString()}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Year</p>
              <p className="font-medium">{car.year}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Mileage</p>
              <p className="font-medium">{car.mileage.toLocaleString()} miles</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Condition</p>
              <p className="font-medium capitalize">{car.condition}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium capitalize">{car.status}</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-600">{car.description}</p>
          </div>

          {car.features && car.features.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Features</h2>
              <ul className="list-disc list-inside space-y-1">
                {car.features.map((feature, index) => (
                  <li key={index} className="text-gray-600">{feature}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h2 className="text-xl font-semibold mb-2">Seller Information</h2>
            <div className="space-y-1">
              <p className="font-medium">{car.seller.name}</p>
              <p className="text-gray-600">{car.seller.email}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={() => navigate('/buy')}>Back to Listings</Button>
            <Button variant="outline" onClick={() => window.history.back()}>Go Back</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetails; 
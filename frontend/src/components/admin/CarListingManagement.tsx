import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Trash, Car, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CarFormModal from "@/components/car/CarFormModal";
import CarEditModal from "@/components/car/CarEditModal";
import axios from "axios";

interface CarImage {
  url: string;
  publicId: string;
}

interface Document {
  url: string;
  publicId: string;
}

interface CarListing {
  _id: string;
  id?: string;
  title: string;
  year: string;
  make: string;
  model: string;
  price: string;
  mileage: string;
  description: string;
  condition: "Excellent" | "Good" | "Fair" | "Poor";
  location: string;
  status: "active" | "sold" | "pending" | "draft";
  images: CarImage[];
  seller: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    location?: string;
  };
  createdAt: string;
  features?: string[];
  exteriorColor?: string;
  interiorColor?: string;
  fuelType?: string;
  transmission?: string;
  rcDocument?: Document;
  insuranceDocument?: Document;
  pucDocument?: Document;
}

// Component for listing header
const ListingHeader = ({ onAddClick }: { onAddClick: () => void }) => (
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-2xl font-semibold">Car Listings</h2>
    <Button onClick={onAddClick}>
      Add Listing
    </Button>
  </div>
);

// Component for car status badge
const StatusBadge = ({ status }: { status: string }) => {
  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    sold: "bg-blue-100 text-blue-800",
    pending: "bg-yellow-100 text-yellow-800",
    draft: "bg-gray-100 text-gray-800"
  };

  return (
    <Badge className={statusColors[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

// Component for empty listings state
const EmptyListingsState = ({ onAddClick }: { onAddClick: () => void }) => (
  <div className="text-center py-12 bg-gray-50 rounded-lg">
    <Car className="h-12 w-12 text-gray-300 mx-auto mb-4" />
    <h3 className="text-lg font-medium mb-1">No Listings Yet</h3>
    <p className="text-gray-500 mb-4">You haven't created any car listings yet.</p>
    <Button onClick={onAddClick}>Create Your First Listing</Button>
  </div>
);

// Component for car listing card
const CarListingCard = ({
  car,
  onDelete,
  onEdit,
  onStatusChange
}: {
  car: CarListing;
  onDelete: (id: string) => void;
  onEdit: (car: CarListing) => void;
  onStatusChange: (id: string, status: string) => void;
}) => {
  return (
    <Card key={car._id}>
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/4 relative aspect-[16/9] md:aspect-auto md:h-auto overflow-hidden">
            {car.images && car.images.length > 0 ? (
              <>
                <img 
                  src={car.images[0].url} 
                  alt={car.title} 
                  className="absolute inset-0 w-full h-full object-contain object-center"
                />
              </>
            ) : (
              <div className="absolute inset-0 w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
          </div>
          <div className="md:w-3/4 p-6">
            <div className="flex justify-between mb-2">
              <h3 className="text-xl font-semibold">{car.title}</h3>
              <StatusBadge status={car.status} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Price</p>
                <p className="font-medium">₹{Number(car.price.replace(/\$/g, '')).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mileage</p>
                <p className="font-medium">{Number(car.mileage).toLocaleString()} km</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Condition</p>
                <p className="font-medium">{car.condition}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">{car.location}</p>
              </div>
            </div>
            <p className="text-gray-700 mb-4 line-clamp-2">{car.description}</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/admin-dashboard/cars/details/${car._id}`}>
                  <Eye className="h-4 w-4 mr-1" /> View
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onEdit(car)}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive border-destructive">
                    <Trash className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the listing for "{car.title}". This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => onDelete(car._id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              {car.status !== "sold" && (
                <select
                  className="h-9 px-3 rounded-md border border-input bg-background text-sm"
                  value={car.status}
                  onChange={(e) => onStatusChange(car._id, e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="sold">Sold</option>
                  <option value="draft">Draft</option>
                </select>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main component
const CarListingManagement: React.FC = () => {
  const [listings, setListings] = useState<CarListing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editListing, setEditListing] = useState<CarListing | null>(null);
  const { toast } = useToast();

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/cars`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        setListings(response.data.data || []);
      } else {
        throw new Error("Failed to fetch car listings");
      }
    } catch (error) {
      console.error("Error fetching car listings:", error);
      setError("Failed to load car listings");
      toast({
        title: "Error",
        description: "Failed to load car listings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleCarModalSuccess = () => {
    setIsAddModalOpen(false);
    setEditListing(null);
    fetchListings();
  };

  const handleDeleteListing = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/cars/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        setListings(prev => prev.filter(car => car._id !== id));
        toast({
          title: "Success",
          description: "Car listing deleted successfully",
        });
      } else {
        throw new Error("Failed to delete car listing");
      }
    } catch (error) {
      console.error("Error deleting car listing:", error);
      toast({
        title: "Error",
        description: "Failed to delete car listing",
        variant: "destructive",
      });
    }
  };

  const handleEditListing = (car: CarListing) => {
    setEditListing({
      ...car,
      id: car._id // Ensure id is set correctly for the edit modal
    });
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/cars/${id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        setListings(prev => prev.map(car => 
          car._id === id ? { ...car, status: status as any } : car
        ));
        
        toast({
          title: "Status Updated",
          description: `Listing status changed to ${status}`,
        });
      } else {
        throw new Error("Failed to update car status");
      }
    } catch (error) {
      console.error("Error updating car status:", error);
      toast({
        title: "Error",
        description: "Failed to update car status",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <span className="ml-3">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 bg-red-50 rounded-lg">
        <h3 className="text-lg font-medium text-red-800 mb-2">{error}</h3>
        <Button onClick={fetchListings}>Try Again</Button>
      </div>
    );
  }

  const filteredByStatus = (status: string) => {
    return listings.filter(car => car.status === status);
  };

  return (
    <div className="space-y-6">
      <ListingHeader onAddClick={() => setIsAddModalOpen(true)} />

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Listings ({listings.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({filteredByStatus('active').length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({filteredByStatus('pending').length})</TabsTrigger>
          <TabsTrigger value="sold">Sold ({filteredByStatus('sold').length})</TabsTrigger>
          <TabsTrigger value="draft">Drafts ({filteredByStatus('draft').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <div className="grid grid-cols-1 gap-4">
            {listings.length > 0 ? (
              listings.map((car) => (
                <CarListingCard
                  key={car._id}
                  car={car}
                  onDelete={handleDeleteListing}
                  onEdit={handleEditListing}
                  onStatusChange={handleStatusChange}
                />
              ))
            ) : (
              <EmptyListingsState onAddClick={() => setIsAddModalOpen(true)} />
            )}
          </div>
        </TabsContent>
        
        {/* Tabs for filtered statuses */}
        {["active", "pending", "sold", "draft"].map((status) => (
          <TabsContent key={status} value={status} className="mt-4">
            <div className="grid grid-cols-1 gap-4">
              {filteredByStatus(status).length > 0 ? (
                filteredByStatus(status).map((car) => (
                  <CarListingCard
                    key={car._id}
                    car={car}
                    onDelete={handleDeleteListing}
                    onEdit={handleEditListing}
                    onStatusChange={handleStatusChange}
                  />
                ))
              ) : (
                <EmptyListingsState onAddClick={() => setIsAddModalOpen(true)} />
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <CarFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <CarEditModal
        isOpen={!!editListing}
        onClose={() => setEditListing(null)}
        listing={editListing}
        onUpdate={() => {
          fetchListings();
          setEditListing(null);
        }}
      />
    </div>
  );
};

export default CarListingManagement;

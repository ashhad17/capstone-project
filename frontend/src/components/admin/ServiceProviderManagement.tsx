import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Search, Plus, Edit, Trash, CheckCircle, XCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import ServiceProviderForm from "../serviceProvider/ServiceProviderForm";

interface ServiceProvider {
  _id: string;
  name: string;
  email: string;
  phone: string;
  status: "active" | "pending" | "inactive";
  services: string[];
  rating: number;
  reviewCount: number;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  createdAt: string;
}

const serviceProviderFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  address: z.object({
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zipCode: z.string().min(1, "Zip code is required"),
  }),
});

const ServiceProviderManagement = () => {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editProvider, setEditProvider] = useState<ServiceProvider | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof serviceProviderFormSchema>>({
    resolver: zodResolver(serviceProviderFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: {
        address: "",
        city: "",
        state: "",
        zipCode: "",
      },
    },
  });

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No auth token found');
      }
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/service-providers`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        const fetchedProviders = response.data.data.serviceProviders
        ;
        if (Array.isArray(fetchedProviders)) {
          setProviders(fetchedProviders);
        } else {
          console.error("Expected an array but got:", fetchedProviders);
          setProviders([]); // Fallback to an empty array
        }
      } else {
        setError("Failed to fetch service providers");
        toast({
          title: "Error",
          description: "Failed to fetch service providers",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching service providers:", error);
      setError("Failed to fetch service providers");
      toast({
        title: "Error",
        description: "Failed to fetch service providers. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProvider = async (data: z.infer<typeof serviceProviderFormSchema>) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No auth token found');
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/service-providers`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setProviders([...providers, response.data.data]);
        setIsAddDialogOpen(false);
        form.reset();
        toast({
          title: "Success",
          description: "Service provider added successfully",
        });
      }
    } catch (error) {
      console.error("Error adding service provider:", error);
      toast({
        title: "Error",
        description: "Failed to add service provider. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleEditProvider = async (data: z.infer<typeof serviceProviderFormSchema>) => {
    if (!editProvider) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No auth token found');
      }

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/service-providers/${editProvider._id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setProviders(providers.map(provider => 
          provider._id === editProvider._id ? response.data.data : provider
        ));
        setEditProvider(null);
        form.reset();
        toast({
          title: "Success",
          description: "Service provider updated successfully",
        });
      }
    } catch (error) {
      console.error("Error updating service provider:", error);
      toast({
        title: "Error",
        description: "Failed to update service provider. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProvider = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No auth token found');
      }

      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/service-providers/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setProviders(providers.filter(provider => provider._id !== id));
        toast({
          title: "Success",
          description: "Service provider deleted successfully",
        });
      }
    } catch (error) {
      console.error("Error deleting service provider:", error);
      toast({
        title: "Error",
        description: "Failed to delete service provider. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateProviderStatus = async (id: string, status: "active" | "pending" | "inactive") => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No auth token found');
      }

      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/service-providers/${id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setProviders(providers.map(provider => 
          provider._id === id ? { ...provider, status } : provider
        ));
        toast({
          title: "Success",
          description: "Service provider status updated successfully",
        });
      }
    } catch (error) {
      console.error("Error updating service provider status:", error);
      toast({
        title: "Error",
        description: "Failed to update service provider status. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const filteredProviders = Array.isArray(providers)
    ? providers.filter((provider) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          provider.name.toLowerCase().includes(searchLower) ||
          provider.email.toLowerCase().includes(searchLower) ||
          provider.phone.toLowerCase().includes(searchLower)
        );
      })
    : [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search providers..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Provider
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
              <DialogTitle>Add New Service Provider</DialogTitle>
              <DialogDescription>
                Create a new service provider account with the following details.
              </DialogDescription>
            </DialogHeader>
            {/* <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddProvider)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Address</h4>
                  <FormField
                    control={form.control}
                    name="address.address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter street" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter city" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address.state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter state" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address.zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zip Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter zip code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Provider</Button>
                </DialogFooter>
              </form>
            </Form> */}
            <ServiceProviderForm/>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Provider</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-destructive">
                  {error}. <Button variant="link" onClick={fetchProviders}>Try again</Button>
                </TableCell>
              </TableRow>
            ) : filteredProviders.length > 0 ? (
              filteredProviders.map((provider) => (
                <TableRow key={provider._id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        {provider.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">{provider.name}</div>
                        <div className="text-sm text-gray-500">
                          {provider.services.length} services
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>{provider.email}</div>
                    <div className="text-sm text-gray-500">{provider.phone}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span className="text-yellow-500 mr-1">★</span>
                      {provider.rating.toFixed(1)}
                      <span className="text-gray-500 ml-1">
                        ({provider.reviewCount} reviews)
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select 
                      defaultValue={provider.status} 
                      onValueChange={(value: "active" | "pending" | "inactive") => handleUpdateProviderStatus(provider._id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active" className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Active
                        </SelectItem>
                        <SelectItem value="pending" className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-yellow-500" />
                          Pending
                        </SelectItem>
                        <SelectItem value="inactive" className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-500" />
                          Inactive
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{formatDate(provider.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setEditProvider(provider);
                          form.reset({
                            name: provider.name,
                            email: provider.email,
                            phone: provider.phone,
                            address: provider.location,
                          });
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the service provider "{provider.name}". This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteProvider(provider._id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No service providers found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Provider Dialog */}
      <Dialog open={!!editProvider} onOpenChange={(open) => !open && setEditProvider(null)}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Service Provider</DialogTitle>
            <DialogDescription>
              Update service provider details below.
            </DialogDescription>
          </DialogHeader>
          {/* <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditProvider)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Address</h4>
                <FormField
                  control={form.control}
                  name="address.address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter street" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter city" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address.state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter state" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address.zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zip Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter zip code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditProvider(null)}>
                  Cancel
                </Button>
                <Button type="submit">Update Provider</Button>
              </DialogFooter>
            </form>
          </Form>
           */}<ServiceProviderForm
      initialData={editProvider} // Pass the selected provider's data
      isEdit={true} // Indicate that this is an edit operation
      onSuccess={() => {
        setEditProvider(null); // Close the dialog on success
        fetchProviders(); // Refresh the list of providers
      }}
      onCancel={() => setEditProvider(null)} // Close the dialog on cancel
    />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceProviderManagement;

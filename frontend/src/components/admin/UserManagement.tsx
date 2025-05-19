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

interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "service_provider" | "admin";
  status: "active" | "pending" | "inactive";
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  avatar?: string;
  createdAt: string;
}

const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["user", "service_provider", "admin"]),
  status: z.enum(["active", "pending", "inactive"]),
  phone: z.string().optional(),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
    })
    .optional(),
});

type UserFormValues = z.infer<typeof userSchema>;

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { toast } = useToast();

  const editForm = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "user",
      status: "active",
    },
  });

  const addForm = useForm<UserFormValues & { password: string }>({
    resolver: zodResolver(
      userSchema.extend({
        password: z.string().min(6, "Password must be at least 6 characters"),
      })
    ),
    defaultValues: {
      name: "",
      email: "",
      role: "user",
      status: "active",
      password: "",
    },
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      editForm.reset({
        name: selectedUser.name,
        email: selectedUser.email,
        role: selectedUser.role,
        status: selectedUser.status,
        phone: selectedUser.phone || "",
        address: selectedUser.address || {},
      });
    }
  }, [selectedUser]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No auth token found');
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        setUsers(response.data.data);
      } else {
        setError("Failed to fetch users");
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to fetch users");
      toast({
        title: "Error",
        description: "Failed to fetch users. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower)
    );
  });

  const handleUpdateUserStatus = async (userId: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/users/${userId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId
              ? { ...user, status: status as "active" | "pending" | "inactive" }
              : user
          )
        );

        toast({
          title: "Status Updated",
          description: `User status has been updated to ${status}.`,
        });
      } else {
        toast({
          title: "Error",
          description: response.data.error || "Failed to update status",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error updating user status:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setUsers(users.filter((user) => user._id !== userId));

        toast({
          title: "User Deleted",
          description: "User has been removed successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: response.data.error || "Failed to delete user",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const onEditSubmit = async (data: UserFormValues) => {
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/users/${selectedUser._id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === selectedUser._id ? { ...user, ...response.data.data } : user
          )
        );

        toast({
          title: "User Updated",
          description: "User details have been updated successfully.",
        });

        setIsEditDialogOpen(false);
      } else {
        toast({
          title: "Error",
          description: response.data.error || "Failed to update user",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update user",
        variant: "destructive",
      });
    }
  };

  const onAddSubmit = async (data: UserFormValues & { password: string }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/users`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setUsers((prevUsers) => [...prevUsers, response.data.data]);

        toast({
          title: "User Created",
          description: "New user has been created successfully.",
        });

        setIsAddDialogOpen(false);
        addForm.reset({
          name: "",
          email: "",
          role: "user",
          status: "active",
          password: "",
        });
      } else {
        toast({
          title: "Error",
          description: response.data.error || "Failed to create user",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create user",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-destructive">
                  {error}. <Button variant="link" onClick={fetchUsers}>Try again</Button>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          <span>{user.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {user.role === "admin" && "Admin"}
                      {user.role === "service_provider" && "Service Provider"}
                      {user.role === "user" && "Regular User"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Select 
                      defaultValue={user.status} 
                      onValueChange={(value) => handleUpdateUserStatus(user._id, value)}
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
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsEditDialogOpen(true);
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
                              This will permanently delete the user "{user.name}". This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteUser(user._id)}
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
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details and permissions.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                

                control={editForm.control}

                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="user">Regular User</SelectItem>
                        <SelectItem value="service_provider">Service Provider</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setSelectedUser(null)}>
                  Cancel
                </Button>
                <Button type="submit">Update User</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;

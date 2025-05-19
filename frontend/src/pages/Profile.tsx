import React, { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import axios from "axios";
import uploadToCloudinary from "@/hooks/cloudinary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Settings,
  Car,
  Shield,
  Bell,
  CreditCard,
  Clock,
  MapPin,
  ChevronRight,
  Lock,
  Key,
  Mail,
  Eye,
  Bookmark
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CarListingManagement from "@/components/car/CarListingManagement";

interface UserActivity {
  id: string;
  type: 'view' | 'message' | 'saved' | 'purchase';
  title: string;
  date: Date;
  image?: string;
}
interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar?: any;
}

const Profile = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
    address: '',
    avatar: ''
  });
  // Mock user activity

  // User settings state
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setProfileLoading(true);
        // Replace with your actual API endpoint
        // console.log(localStorage.getItem('token'));
        const response = await axios.get('http://localhost:5000/api/v1/users/' + user.id, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        console.log("user profile ", response.data.data);
        setUserProfile(response.data.data);
      } catch (error: any) {
        const message = error.response?.data?.message || "Something went wrong.";
        toast({
          variant: "destructive",
          title: "Error",
          description: message,
        });
      } finally {
        setProfileLoading(false);
      }
    };

    if (isAuthenticated && user) {
      fetchUserProfile();
    }
  }, [isAuthenticated, user, toast]);

  // Redirect if not logged in
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null; // Will be redirected
  }
  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }
  
    try {
      setLoading(true);
  
      // Send DELETE request to the backend
      await axios.delete(`http://localhost:5000/api/v1/users/${user.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      toast({
        title: "Account Deleted",
        description: "Your account has been successfully deleted.",
      });
  
      // Log the user out and redirect to the homepage
      localStorage.removeItem("token");
      navigate("/");
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to delete account.";
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Replace with your actual API endpoint
      const response = await axios.put('http://localhost:5000/api/v1/users/' + user.id, userProfile, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Update the auth context with new user data
      setUserProfile(response.data.data);

      toast({
        title: "Profile updated",
        description: "Your profile information has been successfully updated."
      });
    } catch (error: any) {
      const message = error.response?.data?.message || "Something went wrong.";
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const form = e.target as HTMLFormElement;
    const currentPassword = form.currentPassword.value;
    const newPassword = form.newPassword.value;
    const confirmPassword = form.confirmPassword.value;

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "New passwords don't match."
      });
      setLoading(false);
      return;
    }

    try {
      // Replace with your actual API endpoint
      await axios.put('http://localhost:5000/api/v1/auth/updatepassword', {
        currentPassword,
        newPassword
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      toast({
        title: "Password updated",
        description: "Your password has been successfully changed."
      });

      // Clear the form
      form.reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update password. Please check your current password and try again."
      });
    } finally {
      setLoading(false);
    }
  };

  // const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (!e.target.files || e.target.files.length === 0) return;

  //   const file = e.target.files[0];
  //   const formData = new FormData();
  //   formData.append('profileImage', file);

  //   try {
  //     setLoading(true);
  //     // Replace with your actual API endpoint
  //     const response = await axios.post('/api/users/profile-image', formData, {
  //       headers: {
  //         'Content-Type': 'multipart/form-data',
  //         Authorization: `Bearer ${localStorage.getItem('token')}`
  //       }
  //     });

  //     setUserProfile(prev => ({
  //       ...prev,
  //       profileImage: response.data.avatar
  //     }));

  //     // Update the auth context with new profile image
  //     setUserProfile(prev => ({
  //       ...prev,
  //       avatar: response.data.avatar
  //     }));

  //     toast({
  //       title: "Profile image updated",
  //       description: "Your profile image has been successfully updated."
  //     });
  //   } catch (error: any) {
  //     const message = error.response?.data?.message || "Something went wrong.";
  //     toast({
  //       variant: "destructive",
  //       title: "Error",
  //       description: message,
  //     });
  //   }finally {
  //     setLoading(false);
  //   }
  // };
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };
  
  const handleUploadClick = async () => {
    if (!selectedFile) return;

    try {
      setLoading(true);

      // 1. Upload to Cloudinary
      const { url, publicId } = await uploadToCloudinary(selectedFile);

      // 2. Update your backend with avatar + publicId
      const response = await axios.put(`http://localhost:5000/api/v1/users/${user.id}`, {
        avatar: url,
        avatarPublicId: publicId,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // 3. Update state
      setUserProfile(prev => ({
        ...prev,
        avatar: response.data.data.avatar,
      }));

      toast({
        title: "Profile image updated",
        description: "Your profile image has been successfully updated.",
      });

      // Optional: reset
      setPreviewImage(null);
      setSelectedFile(null);

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "Failed to upload image.",
      });
    } finally {
      setLoading(false);
    }
  };

  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setUserProfile(prev => ({
      ...prev,
      [id]: value
    }));
  };

  return (
    <>
      <Helmet>
        <title>My Profile | WheelsTrust</title>
      </Helmet>

      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center mb-8">
              <div className="w-16 h-16 bg-gray-200 rounded-full mr-4 overflow-hidden">
                <img
                  src={userProfile.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold">My Profile</h1>
                <p className="text-gray-600">
                  Manage your account, listings, and preferences
                </p>
              </div>
            </div>

            <Tabs defaultValue="general">
              <TabsList className="mb-8">
                <TabsTrigger value="general">
                  <User className="h-4 w-4 mr-2" />
                  General
                </TabsTrigger>
                {user.role!=='service_provider'?(
                <TabsTrigger value="cars">
                <Car className="h-4 w-4 mr-2" />
                My Cars
              </TabsTrigger>):('')
                }
                <TabsTrigger value="security">
                  <Shield className="h-4 w-4 mr-2" />
                  Security
                </TabsTrigger>

              </TabsList>

              <TabsContent value="general">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>Update your personal details and contact information.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSaveProfile}>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="name">Name</Label>
                              <Input id="name"
                                value={userProfile.name}
                                onChange={handleInputChange}
                                disabled={profileLoading} />
                            </div>

                            {/* <div className="space-y-2">
                              <Label htmlFor="lastName">Last Name</Label>
                              <Input id="lastName" defaultValue={userProfile.name.split(' ')[1]} />
                            </div> */}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email"
                              value={userProfile.email}
                              onChange={handleInputChange}
                              disabled={profileLoading} />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" type="tel" value={userProfile.phone}
                              onChange={handleInputChange}
                              disabled={profileLoading} />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Textarea id="address" value={userProfile.address}
                              onChange={handleInputChange}
                              disabled={profileLoading} />
                          </div>

                          <div className="pt-2">
                          <Button disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>

                          </div>
                        </div>
                      </form>
                    </CardContent>
                  </Card>

                  <Card>
  <CardHeader>
    <CardTitle>Profile Photo</CardTitle>
    <CardDescription>Click the image to select a new profile picture.</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="flex items-center space-x-4">
      <div
        className="w-24 h-24 rounded-full overflow-hidden cursor-pointer ring-2 ring-gray-200"
        onClick={handleImageClick}
      >
        <img
          src={previewImage || userProfile.avatar || "https://via.placeholder.com/96"}
          alt="Profile"
          className="w-full h-full object-cover"
        />
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="space-y-2">
        <Button
          variant="outline"
          onClick={handleUploadClick}
          disabled={!selectedFile || loading}
        >
          {loading ? "Uploading..." : "Upload Photo"}
        </Button>
        <p className="text-xs text-gray-500">JPG, PNG. Max size 800KB.</p>
      </div>
    </div>
  </CardContent>
</Card>



                </div>
              </TabsContent>

              <TabsContent value="cars">
                {/* <Card>
                  <CardHeader>
                    <CardTitle>My Cars</CardTitle>
                    <CardDescription>View and manage your car listings and purchases.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">My Listings</h3>
                        <Button size="sm" variant="outline">+ New Listing</Button>
                      </div>

                      <div className="text-center py-8">
                        <Car className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-1">No Cars Listed Yet</h3>
                        <p className="text-gray-500 mb-4">You haven't listed any cars for sale yet.</p>
                        <Button onClick={() => navigate('/cars/sell')}>Sell a Car</Button>
                      </div>

                      <div className="border-t border-gray-200 pt-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium">Saved Cars</h3>
                          <Button size="sm" variant="ghost">View All</Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="border border-gray-200 rounded-md overflow-hidden flex">
                            <div className="w-1/3 bg-gray-100">
                              <img
                                src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=120&h=80"
                                alt="Honda Accord"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="w-2/3 p-3">
                              <h4 className="font-medium">2020 Honda Accord</h4>
                              <p className="text-sm text-gray-600 mb-2">$22,500 • 15,000 miles</p>
                              <div className="flex space-x-2">
                                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">View</Button>
                                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-destructive hover:text-destructive">Unsave</Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card> */}
                <CarListingManagement/>
              </TabsContent>

              <TabsContent value="security">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Change Password</CardTitle>
                      <CardDescription>Update your account password.</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <form onSubmit={handleUpdatePassword}>
                    <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <div className="relative">
                              <Input id="currentPassword" type="password" />
                              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <div className="relative">
                              <Input id="newPassword" type="password" />
                              <Key className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <div className="relative">
                              <Input id="confirmPassword" type="password" />
                              <Key className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            </div>
                          </div>

                          <div className="pt-2">
                            <Button type="submit" disabled={loading}>
                              {loading ? "Updating..." : "Update Password"}
                            </Button>
                          </div>
                        </div>
                      </form>
                    </CardContent>
                  </Card>



                  <Card>
                    <CardHeader>
                      <CardTitle className="text-destructive">Danger Zone</CardTitle>
                      <CardDescription>Irreversible account actions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="border border-gray-200 rounded-md p-4">
                          <h4 className="font-medium mb-1">Delete Account</h4>
                          <p className="text-sm text-gray-500 mb-3">
                            Permanently delete your account and all your data. This action cannot be undone.
                          </p>
                          <Button variant="destructive" onClick={handleDeleteAccount} disabled={loading}>
  {loading ? "Deleting..." : "Delete My Account"}
</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>


            </Tabs>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Profile;

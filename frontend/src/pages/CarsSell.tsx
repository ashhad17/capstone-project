import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import Loader from "./Loader"
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Car, ChevronDown, Plus, Upload, Info, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import axios from 'axios';
import AuthModal from "@/components/auth/AuthModal";
import * as z from "zod";

const makes = ["Toyota", "Honda", "Ford", "Chevrolet", "BMW", "Mercedes-Benz", "Audi", "Nissan", "Hyundai", "Kia"];
const GOOGLE_API_KEY = 'AIzaSyD1B0trU512-4RPu4N_Bg-Zmxl9HeAQ_2Q';

// Zod Schema Definition
const carFormSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.coerce.number({ required_error: "Year is required", invalid_type_error: "Year must be a number" })
    .int("Year must be a whole number")
    .min(1900, "Year must be 1900 or later")
    .max(new Date().getFullYear() + 1, `Year cannot be after ${new Date().getFullYear() + 1}`),
  mileage: z.coerce.number({ required_error: "Mileage is required", invalid_type_error: "Mileage must be a number" })
    .int("Mileage must be a whole number")
    .positive("Mileage must be a positive number"),
  price: z.coerce.number({ required_error: "Price is required", invalid_type_error: "Price must be a number" })
    .positive("Price must be a positive number"),
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be at most 1000 characters"),
  condition: z.enum(["Excellent", "Good", "Fair", "Poor"], { required_error: "Condition is required" }),
  exteriorColor: z.string().optional(),
  interiorColor: z.string().optional(),
  fuelType: z.enum(["Gasoline", "Diesel", "Hybrid", "Electric"], { required_error: "Fuel type is required" }),
  transmission: z.enum(["Automatic", "Manual", "CVT"], { required_error: "Transmission is required" }),
  bodyType: z.enum(["Sedan", "SUV", "Truck", "Coupe", "Hatchback", "Convertible", "Wagon", "Van"], { required_error: "Body type is required" }),
  features: z.array(z.string()).optional(),
  images: z.array(z.union([z.string().url("Invalid image URL"), z.instanceof(File)]))
    .min(1, "At least one image is required")
    .max(10, "Maximum 10 images allowed"),
  contactName: z.string().min(1, "Contact name is required"),
  contactPhone: z.string().min(1, "Phone number is required").regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format (e.g., +1234567890)"),
  contactEmail: z.string().email("Invalid email address"),
  location: z.string().min(1, "Location is required"),
  totalDriven: z.string().min(1, "Kms driven is required").regex(/^\d+$/, "Kms driven must be a number (e.g., 15000)"),
  rcDocument: z.instanceof(File).nullable().optional(),
  insuranceDocument: z.instanceof(File).nullable().optional(),
  pucDocument: z.instanceof(File).nullable().optional(),
});

type CarFormValues = z.infer<typeof carFormSchema>;

async function calculateEstimatedPrice(details: {
  make: string;
  model: string;
  year: string;
  mileage: string;
  totalDriven: string;
}): Promise<string | null> {
  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Provide an estimated resale price in rupees for a used car based on:
Make: ${details.make},
Model: ${details.model},
Year: ${details.year},
Kilometers Driven: ${details.totalDriven},
Mileage: ${details.mileage}.
Output just the number.`
            }]
          }]
        }),
      }
    );
    if (!resp.ok) throw new Error();
    const data = await resp.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text.trim() || null;
  } catch {
    console.error('AI price fetch failed');
    return null;
  }
}
const uploadToCloudinary = async (file: File): Promise<{ url: string; publicId: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'auto_trust'); // Your upload preset here

  try {
    const response = await axios.post('https://api.cloudinary.com/v1_1/dquspyuhw/upload', formData);

    // Axios automatically parses the response, so you can directly access `data`
    const { secure_url, public_id } = response.data;

    return {
      url: secure_url,
      publicId: public_id,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error uploading to Cloudinary:', error.response?.data || error.message);
    } else {
      console.error('Unexpected error uploading to Cloudinary:', error);
    }
    throw new Error('An error occurred while uploading the file to Cloudinary.');
  }
};


const CarsSell = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("sell-form");
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CarFormValues>({
    make: "",
    model: "",
    year: "" as any,
    mileage: "" as any,
    price: "" as any,
    description: "",
    condition: "Good",
    exteriorColor: "",
    interiorColor: "",
    fuelType: "Gasoline",
    transmission: "Automatic",
    bodyType: "Sedan",
    features: [],
    images: [],
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    location: "",
    totalDriven: "",
    rcDocument: null,
    insuranceDocument: null,
    pucDocument: null,
  });

  const [formErrors, setFormErrors] = useState<z.ZodFormattedError<CarFormValues> | null>(null);

  const [aiPrice, setAiPrice] = useState<string | null>(null);
  const [estimating, setEstimating] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors && formErrors[name as keyof CarFormValues]) {
        setFormErrors(prevErrors => {
            if (!prevErrors) return null;
            const newErrors = { ...prevErrors };
            delete newErrors[name as keyof CarFormValues];
            if (Object.keys(newErrors).length === 1 && newErrors._errors && newErrors._errors.length === 0) {
                 return null;
            }
            return newErrors;
        });
    }
  };

  const handleEstimate = async () => {
    console.log("Starting estimation");
    setEstimating(true);
    const estimate = await calculateEstimatedPrice({
      make: formData.make,
      model: formData.model,
      year: String(formData.year),
      mileage: String(formData.mileage),
      totalDriven: formData.totalDriven,
    });
    console.log("Got estimate:", estimate);
    setAiPrice(estimate);
    setEstimating(false);
  };
  
  const handleDocumentUpload = (name: keyof CarFormValues, file: File) => {
    setFormData({ ...formData, [name]: file as any });
    if (formErrors && formErrors[name]) {
        setFormErrors(prevErrors => {
             if (!prevErrors) return null;
            const newErrors = { ...prevErrors };
            delete newErrors[name];
            if (Object.keys(newErrors).length === 1 && newErrors._errors && newErrors._errors.length === 0) {
                 return null;
            }
            return newErrors;
        });
    }
  };

  const handleRemoveDocument = (name: keyof CarFormValues) => {
    setFormData({ ...formData, [name]: null as any });
  };

  const handleSelectChange = (name: keyof CarFormValues, value: string) => {
    setFormData({ ...formData, [name]: value as any });
    if (formErrors && formErrors[name]) {
        setFormErrors(prevErrors => {
            if (!prevErrors) return null;
            const newErrors = { ...prevErrors };
            delete newErrors[name];
            if (Object.keys(newErrors).length === 1 && newErrors._errors && newErrors._errors.length === 0) {
                 return null;
            }
            return newErrors;
        });
    }
  };

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = [...formData.images];
      for (let i = 0; i < e.target.files.length; i++) {
        newImages.push(e.target.files[i]);
      }
      setFormData({ ...formData, images: newImages });
       if (formErrors?.images) {
         setFormErrors(prevErrors => {
            if (!prevErrors) return null;
            const newErrors = { ...prevErrors };
            delete newErrors.images;
             if (Object.keys(newErrors).length === 1 && newErrors._errors && newErrors._errors.length === 0) {
                 return null;
            }
            return newErrors;
        });
      }
    }
  };
  
  const handleRemoveImage = (index: number) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData({ ...formData, images: newImages });
  };

  const step1Schema = carFormSchema.pick({
    make: true, model: true, year: true, mileage: true, price: true,
    description: true, condition: true, exteriorColor: true, interiorColor: true,
    fuelType: true, transmission: true, bodyType: true, totalDriven: true,
  });
  const step2Schema = carFormSchema.pick({
    images: true, features: true, rcDocument: true, insuranceDocument: true, pucDocument: true,
  });
  const step3Schema = carFormSchema.pick({
    contactName: true, contactPhone: true, contactEmail: true, location: true,
  });

  const validateCurrentStep = () => {
    let currentSchema;
    if (currentStep === 1) currentSchema = step1Schema;
    else if (currentStep === 2) currentSchema = step2Schema;
    else if (currentStep === 3) currentSchema = step3Schema;
    else return true;

    const result = currentSchema.safeParse(formData);
    if (!result.success) {
      setFormErrors(result.error.format());
      toast({
        title: "Validation Error",
        description: "Please fix the errors highlighted on the current step.",
        variant: "destructive",
      });
      return false;
    }
    setFormErrors(prevErrors => {
        if (!prevErrors) return null;
        const stepFields = Object.keys(currentSchema.shape) as (keyof CarFormValues)[];
        let allStepFieldsValid = true;
        stepFields.forEach(field => {
            if (prevErrors[field]) {
                allStepFieldsValid = false;
            }
        });
        return null; 
    });
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationResult = carFormSchema.safeParse(formData);
    if (!validationResult.success) {
      setFormErrors(validationResult.error.format());
      toast({
        title: "Validation Error",
        description: "Please correct all errors before submitting.",
        variant: "destructive",
      });
      return;
    }
    setFormErrors(null);
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const imageUploads = formData.images.map(async (image) => {
        if (typeof image === 'string') {
          return { url: image, publicId: `existing-${Date.now()}` }; 
        }
        return await uploadToCloudinary(image);
      });

      const documentUploadPromises: Promise<{ type: string; url: string; publicId: string } | null>[] = [];
      
      if (formData.rcDocument) {
        documentUploadPromises.push(uploadToCloudinary(formData.rcDocument)
          .then(result => ({ type: 'rcDocument', ...result })));
      }
      
      if (formData.insuranceDocument) {
        documentUploadPromises.push(uploadToCloudinary(formData.insuranceDocument)
          .then(result => ({ type: 'insuranceDocument', ...result })));
      }
      
      if (formData.pucDocument) {
        documentUploadPromises.push(uploadToCloudinary(formData.pucDocument)
          .then(result => ({ type: 'pucDocument', ...result })));
      }

      const uploadedImagesResults = await Promise.all(imageUploads);
      const uploadedDocumentsResults = await Promise.all(documentUploadPromises);
      
      const uploadedDocuments = uploadedDocumentsResults.filter(doc => doc !== null) as { type: string; url: string; publicId: string }[];

      const carData = {
        title: `${formData.year} ${formData.make} ${formData.model}`,
        make: formData.make,
        model: formData.model,
        year: Number(formData.year),
        mileage: Number(formData.mileage),
        price: Number(formData.price),
        description: formData.description,
        condition: formData.condition,
        exteriorColor: formData.exteriorColor,
        interiorColor: formData.interiorColor,
        fuelType: formData.fuelType,
        transmission: formData.transmission,
        bodyType: formData.bodyType,
        features: formData.features,
        images: uploadedImagesResults,
        contactName: formData.contactName,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        totalDriven: formData.totalDriven,
        location: formData.location,
        rcDocument: uploadedDocuments.find(doc => doc?.type === 'rcDocument') || null,
        insuranceDocument: uploadedDocuments.find(doc => doc?.type === 'insuranceDocument') || null,
        pucDocument: uploadedDocuments.find(doc => doc?.type === 'pucDocument') || null,
        status: 'pending',
      };

      console.log("Car Data to be submitted:", JSON.stringify(carData, null, 2));

      const response = await fetch('http://localhost:5000/api/v1/cars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(carData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText, _server_error_parsing_failed: true }));
        console.error('Server responded with error:', errorData);
        throw new Error(errorData.message || 'Failed to create listing');
      }

      toast({
        title: "Listing Created!",
        description: "Your vehicle listing has been submitted successfully.",
      });
      
      setCurrentStep(4);
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMessage = error instanceof Error ? error.message : "There was an error submitting your listing. Please try again.";
      toast({
        title: "Submission Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    "Bluetooth", "Backup Camera", "Navigation", "Heated Seats", 
    "Sunroof", "Leather Seats", "Apple CarPlay", "Android Auto",
    "Blind Spot Monitor", "Lane Departure Warning", "Cruise Control",
    "Remote Start", "Keyless Entry", "Premium Audio", "Third Row Seating"
  ];
  
  const handleFeatureToggle = (feature: string) => {
    const newFeatures = formData.features.includes(feature) 
      ? formData.features.filter(f => f !== feature) 
      : [...formData.features, feature];
      
    setFormData({ ...formData, features: newFeatures });
  };
  
  const nextStep = () => {
    if (!validateCurrentStep()) return;
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };
  
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Vehicle Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Make*</label>
                <Select 
                  value={formData.make} 
                  onValueChange={(value) => handleSelectChange("make", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select make" />
                  </SelectTrigger>
                  <SelectContent>
                    {makes.map((make) => (
                      <SelectItem key={make} value={make}>{make}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors?.make?._errors?.[0] && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{formErrors.make._errors[0]}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Model*</label>
                <Input
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="e.g. Camry"
                />
                {formErrors?.model?._errors?.[0] && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{formErrors.model._errors[0]}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Year*</label>
                <Input
                  name="year"
                  type="number"
                  value={String(formData.year)}
                  onChange={handleChange}
                  placeholder="e.g. 2020"
                />
                {formErrors?.year?._errors?.[0] && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{formErrors.year._errors[0]}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Mileage*</label>
                <Input
                  name="mileage"
                  type="number"
                  value={String(formData.mileage)}
                  onChange={handleChange}
                  placeholder="e.g. 35000 (km/liter)"
                />
                {formErrors?.mileage?._errors?.[0] && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{formErrors.mileage._errors[0]}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Kms Driven*</label>
                <Input
                  name="totalDriven"
                  value={formData.totalDriven}
                  onChange={handleChange}
                  placeholder="e.g 15000"
                />
                {formErrors?.totalDriven?._errors?.[0] && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{formErrors.totalDriven._errors[0]}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Exterior Color</label>
                <Input
                  name="exteriorColor"
                  value={formData.exteriorColor}
                  onChange={handleChange}
                  placeholder="e.g. Blue"
                />
                {formErrors?.exteriorColor?._errors?.[0] && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{formErrors.exteriorColor._errors[0]}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Interior Color</label>
                <Input
                  name="interiorColor"
                  value={formData.interiorColor}
                  onChange={handleChange}
                  placeholder="e.g. Black"
                />
                {formErrors?.interiorColor?._errors?.[0] && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{formErrors.interiorColor._errors[0]}</p>}
              </div>
             
              <div className="space-y-2">
                <label className="text-sm font-medium">Fuel Type*</label>
                <Select 
                  value={formData.fuelType} 
                  onValueChange={(value) => handleSelectChange("fuelType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select fuel type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gasoline">Gasoline</SelectItem>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                    <SelectItem value="Electric">Electric</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors?.fuelType?._errors?.[0] && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{formErrors.fuelType._errors[0]}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Transmission*</label>
                <Select 
                  value={formData.transmission} 
                  onValueChange={(value) => handleSelectChange("transmission", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select transmission" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Automatic">Automatic</SelectItem>
                    <SelectItem value="Manual">Manual</SelectItem>
                    <SelectItem value="CVT">CVT</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors?.transmission?._errors?.[0] && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{formErrors.transmission._errors[0]}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Body Type*</label>
                <Select 
                  value={formData.bodyType} 
                  onValueChange={(value) => handleSelectChange("bodyType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select body type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sedan">Sedan</SelectItem>
                    <SelectItem value="SUV">SUV</SelectItem>
                    <SelectItem value="Truck">Truck</SelectItem>
                    <SelectItem value="Coupe">Coupe</SelectItem>
                    <SelectItem value="Hatchback">Hatchback</SelectItem>
                    <SelectItem value="Convertible">Convertible</SelectItem>
                    <SelectItem value="Wagon">Wagon</SelectItem>
                    <SelectItem value="Van">Van</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors?.bodyType?._errors?.[0] && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{formErrors.bodyType._errors[0]}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Condition*</label>
                <Select 
                  value={formData.condition} 
                  onValueChange={(value) => handleSelectChange("condition", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Fair">Fair</SelectItem>
                    <SelectItem value="Poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors?.condition?._errors?.[0] && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{formErrors.condition._errors[0]}</p>}
              </div>
              
              <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-2">
                <label className="text-sm font-medium">Price (Rupees)*</label>
                <Input
                  name="price"
                  type="number"
                  value={String(formData.price)}
                  onChange={handleChange}
                  placeholder="e.g. 500000"
                />
                {formErrors?.price?._errors?.[0] && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{formErrors.price._errors[0]}</p>}
              </div>
              {/* AI Estimate */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3 flex items-center gap-4 mt-2">
  <Button type="button" onClick={handleEstimate} disabled={estimating}>
    {estimating ? 'Estimating…' : 'AI Estimated Price'}
  </Button>
  {estimating ? (
  <Loader />
) : (
  aiPrice && <span>💰 {aiPrice}</span>
)}

</div>
              <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-2">
                <label className="text-sm font-medium">Description* (Min 10, Max 1000 chars)</label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your vehicle condition, history, and any other important details..."
                  className="min-h-[150px]"
                />
                {formErrors?.description?._errors?.[0] && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{formErrors.description._errors[0]}</p>}
              </div>
            </div>
            
            <div className="pt-4 flex justify-end">
              <Button onClick={nextStep}>
                Next Step
              </Button>
            </div>
          </div>
        );
     
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Vehicle Photos, Features & Documents</h3>
            
            <div className="space-y-4">
              <label className="text-sm font-medium">Photos* (Min 1, Max 10)</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {formData.images.map((img, index) => {
                  const imgSrc = typeof img === 'string' ? img : URL.createObjectURL(img);
                  return (
                    <div key={index} className="relative aspect-square bg-gray-100 rounded-md overflow-hidden">
                      <img 
                        src={imgSrc} 
                        alt={`Car photo ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
                
                <label className="flex flex-col items-center justify-center aspect-square bg-gray-100 border-2 border-dashed border-gray-300 rounded-md p-4 hover:border-gray-400 cursor-pointer">
                  <Upload className="h-6 w-6 text-gray-400 mb-1" />
                  <span className="text-sm text-gray-500">Add Photo</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleAddImage}
                  />
                </label>
              </div>
              {formErrors?.images?._errors?.[0] && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{formErrors.images._errors[0]}</p>}
              {typeof formErrors?.images === 'object' && !formErrors?.images?._errors && Object.values(formErrors.images).map((error: any, index: number) => error?._errors?.[0] ? <p key={index} className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />Image {index + 1}: {error._errors[0]}</p> : null)}
              <p className="text-xs text-gray-500">Upload up to 10 photos. First photo will be used as the main image.</p>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium">Features</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {features.map((feature) => (
                  <div 
                    key={feature}
                    onClick={() => handleFeatureToggle(feature)}
                    className={`px-3 py-2 rounded-md cursor-pointer border text-sm ${
                      formData.features.includes(feature) 
                        ? 'bg-primary/10 border-primary text-primary' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      {formData.features.includes(feature) && (
                        <svg className="h-4 w-4 mr-1.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {feature}
                    </div>
                  </div>
                ))}
              </div>
              {formErrors?.features?._errors?.[0] && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{formErrors.features._errors[0]}</p>}
              <p className="text-xs text-gray-500">Select all features that apply to your vehicle.</p>
            </div>
            
            <div className="space-y-4">
              <label className="text-sm font-medium">Vehicle Documents (Optional)</label>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-md p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">RC Document</span>
                    {formData.rcDocument && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDocument("rcDocument")}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {formData.rcDocument ? (
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="h-5 w-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formData.rcDocument.name}
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-4 hover:border-gray-400 cursor-pointer">
                      <Upload className="h-6 w-6 text-gray-400 mb-1" />
                      <span className="text-sm text-gray-500">Upload RC</span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => e.target.files && handleDocumentUpload("rcDocument", e.target.files[0])}
                      />
                    </label>
                  )}
                  {formErrors?.rcDocument?._errors?.[0] && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{formErrors.rcDocument._errors[0]}</p>}
                </div>
                
                <div className="border rounded-md p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Insurance</span>
                    {formData.insuranceDocument && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDocument("insuranceDocument")}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {formData.insuranceDocument ? (
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="h-5 w-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formData.insuranceDocument.name}
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-4 hover:border-gray-400 cursor-pointer">
                      <Upload className="h-6 w-6 text-gray-400 mb-1" />
                      <span className="text-sm text-gray-500">Upload Insurance</span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => e.target.files && handleDocumentUpload("insuranceDocument", e.target.files[0])}
                      />
                    </label>
                  )}
                  {formErrors?.insuranceDocument?._errors?.[0] && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{formErrors.insuranceDocument._errors[0]}</p>}
                </div>
                
                <div className="border rounded-md p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">PUC Certificate</span>
                    {formData.pucDocument && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDocument("pucDocument")}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {formData.pucDocument ? (
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="h-5 w-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formData.pucDocument.name}
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-4 hover:border-gray-400 cursor-pointer">
                      <Upload className="h-6 w-6 text-gray-400 mb-1" />
                      <span className="text-sm text-gray-500">Upload PUC</span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => e.target.files && handleDocumentUpload("pucDocument", e.target.files[0])}
                      />
                    </label>
                  )}
                  {formErrors?.pucDocument?._errors?.[0] && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{formErrors.pucDocument._errors[0]}</p>}
                </div>
              </div>
              <p className="text-xs text-gray-500">Upload clear scans or photos of your vehicle documents (PDF, JPG, PNG).</p>
            </div>
            
            <div className="pt-4 flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                Previous Step
              </Button>
              <Button onClick={nextStep}>
                Next Step
              </Button>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Name*</label>
                <Input
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  placeholder="Full name"
                />
                {formErrors?.contactName?._errors?.[0] && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{formErrors.contactName._errors[0]}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number*</label>
                <Input
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  placeholder="e.g. +1234567890"
                />
                {formErrors?.contactPhone?._errors?.[0] && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{formErrors.contactPhone._errors[0]}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address*</label>
                <Input
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  type="email"
                  placeholder="e.g. your.email@example.com"
                />
                {formErrors?.contactEmail?._errors?.[0] && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{formErrors.contactEmail._errors[0]}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Location*</label>
                <Input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. San Francisco, CA"
                />
                {formErrors?.location?._errors?.[0] && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{formErrors.location._errors[0]}</p>}
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <Info className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800 mb-1">Privacy Note</h4>
                  <p className="text-sm text-blue-700">
                    Your contact information will be visible to potential buyers. We recommend using a phone number you're comfortable sharing.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="pt-4 flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                Previous Step
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Listing"}
              </Button>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="text-center py-8">
            <div className="bg-green-100 text-green-800 rounded-full mx-auto w-16 h-16 flex items-center justify-center mb-6">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-2">Listing Submitted!</h3>
            <p className="text-gray-600 mb-6 max-w-lg mx-auto">
              Your vehicle listing has been submitted successfully. Our team will review it shortly, and it will be live on our marketplace soon.
            </p>
            <div className="space-y-3">
              <Link to="/profile">
                <Button className="w-full sm:w-auto">
                  View My Listings
                </Button>
              </Link>
              <div className="block sm:inline-block sm:ml-3">
                <Link to="/cars/buy">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Browse Cars
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Sell Your Car | WheelsTrust</title>
      </Helmet>
      
      <Navbar />
      
      <main className={`pt-24 pb-16 ${isDark ? 'bg-gray-900 text-white' : ''}`}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                  <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : ''}`}>Sell Your Car</h1>
                  <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>List your vehicle on WheelsTrust and reach thousands of potential buyers.</p>
                </div>
                
                <TabsList className={`grid w-full sm:w-auto grid-cols-2 sm:grid-cols-1 ${isDark ? 'bg-gray-800' : ''}`}>
                  <TabsTrigger value="sell-form" className={isDark ? 'data-[state=active]:bg-gray-700' : ''}>Sell Your Car</TabsTrigger>
                  <TabsTrigger value="selling-tips" className={isDark ? 'data-[state=active]:bg-gray-700' : ''}>Selling Tips</TabsTrigger>
                </TabsList>
              </div>
              
              <div className={`bg-white rounded-lg shadow-md overflow-hidden ${isDark ? 'bg-gray-800 shadow-glow-dark' : ''}`}>
                <TabsContent value="sell-form" className="p-0">
                  {currentStep < 4 && (
                    <div className={`bg-gray-50 border-b px-6 py-4 ${isDark ? 'bg-gray-700 border-gray-600' : ''}`}>
                      <div className="flex items-center">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-2 ${currentStep >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'} ${isDark && currentStep < 1 ? 'bg-gray-600 text-gray-300' : ''}`}>
                          1
                        </div>
                        <div className={`h-1 w-full ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                          <div className={`h-1 ${currentStep >= 2 ? 'bg-primary' : isDark ? 'bg-gray-600' : 'bg-gray-200'}`} style={{ width: '100%' }}></div>
                        </div>
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full mx-2 ${currentStep >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'} ${isDark && currentStep < 2 ? 'bg-gray-600 text-gray-300' : ''}`}>
                          2
                        </div>
                        <div className={`h-1 w-full ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                          <div className={`h-1 ${currentStep >= 3 ? 'bg-primary' : isDark ? 'bg-gray-600' : 'bg-gray-200'}`} style={{ width: '100%' }}></div>
                        </div>
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ml-2 ${currentStep >= 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'} ${isDark && currentStep < 3 ? 'bg-gray-600 text-gray-300' : ''}`}>
                          3
                        </div>
                      </div>
                      <div className={`flex justify-between text-xs mt-1 ${isDark ? 'text-gray-300' : ''}`}>
                        <span>Vehicle Details</span>
                        <span>Photos & Features</span>
                        <span>Contact Info</span>
                      </div>
                    </div>
                  )}
                  
                  <div className={`p-6 ${isDark ? 'bg-gray-800 text-gray-200' : ''}`}>
                    <form>
                      {renderStep()}
                    </form>
                  </div>
                </TabsContent>
                
                <TabsContent value="selling-tips" className={`p-6 space-y-6 ${isDark ? 'bg-gray-800 text-gray-200' : ''}`}>
                  <div>
                    <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : ''}`}>Tips to Sell Your Car Quickly</h3>
                    
                    <ul className="space-y-4">
                      <li className="flex">
                        <span className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">1</span>
                        <div>
                          <h4 className="font-medium mb-1">Take Quality Photos</h4>
                          <p className="text-gray-600 text-sm">
                            Clean your car thoroughly and take clear photos in good lighting from multiple angles, including the interior, exterior, and under the hood.
                          </p>
                        </div>
                      </li>
                      
                      <li className="flex">
                        <span className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">2</span>
                        <div>
                          <h4 className="font-medium mb-1">Set a Competitive Price</h4>
                          <p className="text-gray-600 text-sm">
                            Research similar vehicles in your area to determine a fair market value. Pricing your car competitively will attract more interest.
                          </p>
                        </div>
                      </li>
                      
                      <li className="flex">
                        <span className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">3</span>
                        <div>
                          <h4 className="font-medium mb-1">Provide Detailed Information</h4>
                          <p className="text-gray-600 text-sm">
                            Include maintenance history, recent repairs, and all features. Being transparent builds trust with potential buyers.
                          </p>
                        </div>
                      </li>
                      
                      <li className="flex">
                        <span className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">4</span>
                        <div>
                          <h4 className="font-medium mb-1">Respond Quickly</h4>
                          <p className="text-gray-600 text-sm">
                            Reply promptly to inquiries and be available for questions and test drives. Quick response times increase your chances of selling.
                          </p>
                        </div>
                      </li>
                      
                      <li className="flex">
                        <span className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">5</span>
                        <div>
                          <h4 className="font-medium mb-1">Have Documentation Ready</h4>
                          <p className="text-gray-600 text-sm">
                            Prepare all necessary paperwork including title, service records, and bill of sale to make the transaction smooth.
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  
                  <div className={`${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border'} rounded-md p-4`}>
                    <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : ''}`}>Need help selling your car?</h4>
                    <p className={isDark ? 'text-gray-300 text-sm mb-3' : 'text-gray-600 text-sm mb-3'}>
                      Our team of experts can help you sell your car faster. From professional photography to handling inquiries on your behalf.
                    </p>
                    <Button 
                      variant="outline"
                      className={isDark ? 'border-gray-600 bg-gray-700 text-white hover:bg-gray-600' : ''}
                    >
                      Learn About Concierge Service
                    </Button>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default CarsSell;

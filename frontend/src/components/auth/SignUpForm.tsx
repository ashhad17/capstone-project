import React, { useState, useEffect, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { useTheme } from '@/context/ThemeContext'; // Import useTheme hook

import { Input } from '@/components/ui/input';
import { Eye, EyeOff, User, Mail, Phone, Home, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

import { motion, AnimatePresence } from 'framer-motion';

// Password strength indicators
const passwordStrengthSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .refine((value) => /[A-Z]/.test(value), {
    message: 'Password must contain at least one uppercase letter',
  })
  .refine((value) => /[a-z]/.test(value), {
    message: 'Password must contain at least one lowercase letter',
  })
  .refine((value) => /[0-9]/.test(value), {
    message: 'Password must contain at least one number',
  })
  .refine((value) => /[^A-Za-z0-9]/.test(value), {
    message: 'Password must contain at least one special character',
  });

// Step 1 schema - Personal Information
const step1Schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: passwordStrengthSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Step 2 schema - Contact Information
const step2Schema = z.object({
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
});

// Step 3 schema - Address Information
const step3Schema = z.object({
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(1, 'Zip code is required'),
  }),
});

// Combined schema for all steps - Fixed by manually creating the complete schema
const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: passwordStrengthSchema,
  confirmPassword: z.string(),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(1, 'Zip code is required'),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

const SignUpForm = ({ onComplete, onCancel }: { onComplete: () => void; onCancel: () => void }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [flip, setFlip] = useState(false);
  const { toast } = useToast();
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  // Set up form with react-hook-form
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
      },
    },
  });

  // Password strength calculation
  useEffect(() => {
    const password = form.watch('password');
    if (!password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    setPasswordStrength(strength);
  }, [form.watch('password')]);

  // Format phone number as user types
  const formatPhoneNumber = (value: string) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  // Handle phone input change with formatting
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhoneNumber = formatPhoneNumber(e.target.value);
    form.setValue('phone', formattedPhoneNumber, { shouldValidate: true });
  };

  const validateCurrentStep = async () => {
    if (currentStep === 1) {
      return form.trigger(['name', 'email', 'password', 'confirmPassword']);
    } else if (currentStep === 2) {
      return form.trigger(['phone']);
    } else if (currentStep === 3) {
      return form.trigger(['address.street', 'address.city', 'address.state', 'address.zipCode']);
    }
    return true;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    setFlip(true);
    setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
      setFlip(false);
    }, 400);
  };

  const handlePrevious = () => {
    setFlip(true);
    setTimeout(() => {
      setCurrentStep((prev) => prev - 1);
      setFlip(false);
    }, 400);
  };

  const onSubmit = async (data: SignUpFormValues) => {
    setIsLoading(true);

    try {
      // Prepare data for API call
      const userData = {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone.replace(/[^\d]/g, ''),
        address: data.address,
      };

      // API call to register user
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/auth/register`,
        userData
      );

      if (response.data?.message) {
        toast({
          title: 'Registration successful!',
          description: 'Your account has been created successfully.Please Verify your Email to continue using the account.',
        });
        
        // Wait for the toast to be visible before proceeding
        setTimeout(() => {
          onComplete();
        }, 1000);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || 'An error occurred during registration';
      toast({
        title: 'Registration failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getProgressWidth = () => {
    return currentStep === 1 ? 'w-1/3' 
         : currentStep === 2 ? 'w-2/3' 
         : 'w-full';
  };

  const getStepIcon = (step: number) => {
    if (step === 1) return <User className="h-5 w-5" />;
    if (step === 2) return <Phone className="h-5 w-5" />;
    return <Home className="h-5 w-5" />;
  };

  const renderPasswordStrengthIndicator = () => {
    const strengthText = [
      'Very Weak',
      'Weak',
      'Fair',
      'Good',
      'Strong'
    ];
    
    const strengthColors = [
      'bg-red-500',
      'bg-orange-500',
      'bg-yellow-500',
      'bg-blue-500',
      'bg-green-500'
    ];

    return (
      <div className="mt-2">
        <div className="flex gap-1 h-1">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i}
              className={`h-full flex-1 rounded-full transition-colors duration-300 ${
                i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        {form.watch('password') && (
          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="text-xs mt-1"
            style={{ color: passwordStrength > 3 ? '#16a34a' : 
                           passwordStrength > 2 ? '#2563eb' : 
                           passwordStrength > 1 ? '#d97706' : '#ef4444' }}
          >
            {strengthText[passwordStrength - 1] || 'Very Weak'}
          </motion.p>
        )}
      </div>
    );
  };

  // Prevent memory leaks by not animating if component is unmounting
  const isMounted = useRef(true);
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const cardVariants = {
    front: {
      rotateY: flip ? 180 : 0,
      transition: { duration: 0.4 }
    },
    back: {
      rotateY: flip ? 0 : -180,
      transition: { duration: 0.4 }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {[1, 2, 3].map((step) => (
            <motion.div
              key={step}
              className={`w-8 h-8 rounded-full flex items-center justify-center 
                ${currentStep >= step ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'}`}
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ 
                scale: currentStep === step ? 1.1 : 1, 
                opacity: currentStep === step ? 1 : 0.7 
              }}
              transition={{ duration: 0.3 }}
            >
              {getStepIcon(step)}
            </motion.div>
          ))}
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className={`h-full bg-primary`}
            initial={{ width: '0%' }}
            animate={{ width: currentStep === 1 ? '33%' : currentStep === 2 ? '66%' : '100%' }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-500">
          <span className={currentStep === 1 ? 'font-medium text-primary' : ''}>Personal</span>
          <span className={currentStep === 2 ? 'font-medium text-primary' : ''}>Contact</span>
          <span className={currentStep === 3 ? 'font-medium text-primary' : ''}>Address</span>
        </div>
      </div>

      <div className="relative perspective" style={{ perspective: '1000px' }}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Personal Information */}
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  className="space-y-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-xl font-bold text-center">Personal Information</h2>
                  
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <div className="relative">
                          <FormLabel className={`absolute left-3 transition-all duration-200 ${
                            field.value ? '-top-2.5 bg-white px-1 text-xs' : 'top-2.5 text-sm text-gray-500'
                          }`}>
                            Full Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className={`pt-5 pl-3 h-14 ${field.value ? 'border-primary' : ''}`}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <div className="relative">
                          <FormLabel className={`absolute left-3 transition-all duration-200 ${
                            field.value ? '-top-2.5 bg-white px-1 text-xs' : 'top-2.5 text-sm text-gray-500'
                          }`}>
                            Email Address
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              {...field}
                              className={`pt-5 pl-3 h-14 ${field.value ? 'border-primary' : ''}`}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="relative">
                          <FormLabel className={`absolute left-3 transition-all duration-200 ${
                            field.value ? '-top-2.5 bg-white px-1 text-xs' : 'top-2.5 text-sm text-gray-500'
                          }`}>
                            Password
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? 'text' : 'password'}
                                {...field}
                                className={`pt-5 pl-3 h-14 pr-10 ${field.value ? 'border-primary' : ''}`}
                              />
                              <button
                                type="button"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>
                          </FormControl>
                          {renderPasswordStrengthIndicator()}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <div className="relative">
                          <FormLabel className={`absolute left-3 transition-all duration-200 ${
                            field.value ? '-top-2.5 bg-white px-1 text-xs' : 'top-2.5 text-sm text-gray-500'
                          }`}>
                            Confirm Password
                          </FormLabel>
                          <FormControl>
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              {...field}
                              className={`pt-5 pl-3 h-14 ${field.value ? 'border-primary' : ''}`}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
              )}

              {/* Step 2: Contact Information */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  className="space-y-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-xl font-bold text-center">Contact Information</h2>
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <div className="relative">
                          <FormLabel className={`absolute left-3 transition-all duration-200 ${
                            field.value ? '-top-2.5 bg-white px-1 text-xs' : 'top-2.5 text-sm text-gray-500'
                          }`}>
                            Phone Number
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value}
                              onChange={handlePhoneChange}
                              className={`pt-5 pl-3 h-14 ${field.value ? 'border-primary' : ''}`}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="pt-8">
                    <p className="text-sm text-gray-500 mb-6">
                      We'll send a verification code to your phone number to verify your account.
                    </p>
                    
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                      <p className="text-sm text-blue-700 flex items-start">
                        <span className="flex-shrink-0 mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </span>
                        Your phone number will only be used for account verification and important notifications. We respect your privacy.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Address Information */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  className="space-y-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-xl font-bold text-center">Address Information</h2>
                  
                  <FormField
                    control={form.control}
                    name="address.street"
                    render={({ field }) => (
                      <FormItem>
                        <div className="relative">
                          <FormLabel className={`absolute left-3 transition-all duration-200 ${
                            field.value ? '-top-2.5 bg-white px-1 text-xs' : 'top-2.5 text-sm text-gray-500'
                          }`}>
                            Street Address
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className={`pt-5 pl-3 h-14 ${field.value ? 'border-primary' : ''}`}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="address.city"
                    render={({ field }) => (
                      <FormItem>
                        <div className="relative">
                          <FormLabel className={`absolute left-3 transition-all duration-200 ${
                            field.value ? '-top-2.5 bg-white px-1 text-xs' : 'top-2.5 text-sm text-gray-500'
                          }`}>
                            City
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className={`pt-5 pl-3 h-14 ${field.value ? 'border-primary' : ''}`}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="address.state"
                      render={({ field }) => (
                        <FormItem>
                          <div className="relative">
                            <FormLabel className={`absolute left-3 transition-all duration-200 ${
                              field.value ? '-top-2.5 bg-white px-1 text-xs' : 'top-2.5 text-sm text-gray-500'
                            }`}>
                              State
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className={`pt-5 pl-3 h-14 ${field.value ? 'border-primary' : ''}`}
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="address.zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <div className="relative">
                            <FormLabel className={`absolute left-3 transition-all duration-200 ${
                              field.value ? '-top-2.5 bg-white px-1 text-xs' : 'top-2.5 text-sm text-gray-500'
                            }`}>
                              Zip Code
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className={`pt-5 pl-3 h-14 ${field.value ? 'border-primary' : ''}`}
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

<div className="flex justify-between pt-6">
  {currentStep > 1 ? (
    <Button 
      type="button" 
      variant="outline" 
      onClick={handlePrevious}
      className="flex items-center"
    >
      <ArrowLeft className="mr-2 h-4 w-4" /> Back
    </Button>
  ) : (
    <Button 
      type="button" 
      variant="outline" 
      onClick={onCancel}
    >
      Cancel
    </Button>
  )}
  
  {currentStep < 3 ? (
    <Button 
      type="button" 
      onClick={handleNext}
      className="flex items-center"
    >
      Next <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  ) : (
    <Button 
      type="submit" 
      disabled={isLoading}
      className="flex items-center"
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Submitting...
        </>
      ) : (
        <>
          Complete <CheckCircle className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  )}
</div>
</form>
</Form>
</div>
</div>
  );
};

export default SignUpForm;


import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/context/ThemeContext';
import { motion } from 'framer-motion';
import { Eye, EyeOff, CheckCircle, Shield, AlertCircle } from 'lucide-react';
import axios from 'axios';

const resetPasswordSchema = z.object({
  password: z.string()
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
    }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const ResetPasswordForm: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const { isDark } = useTheme();

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/auth/reset-password/${token}`,
        { password: data.password }
      );

      toast({
        title: "Password Reset Successful",
        description: response.data.message || "Your password has been reset successfully.",
      });

      setResetSuccess(true);
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to reset password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check password strength
  const getPasswordStrength = (password: string) => {
    if (!password) return 0;
    
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    return score;
  };

  const password = form.watch('password');
  const passwordStrength = getPasswordStrength(password);

  if (resetSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`text-center p-6 rounded-lg shadow-md ${isDark ? 'bg-gray-800 text-white' : 'bg-white'}`}
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
          <CheckCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Password Reset Successful!</h2>
        <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Your password has been reset successfully. You will be redirected to the login page shortly.
        </p>
        <Button onClick={() => navigate('/login')} className="w-full">
          Go to Login
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`w-full max-w-md mx-auto ${isDark ? 'text-white' : ''}`}
    >
      <div className="mb-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
          <Shield size={32} />
        </div>
        <h2 className="text-2xl font-bold">Reset Your Password</h2>
        <p className={`mt-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Create a new strong password for your account
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">New Password</label>
          <div className="relative">
            <Input 
              {...form.register('password')} 
              type={showPassword ? "text" : "password"} 
              className={`pr-10 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              {showPassword ? (
                <EyeOff size={18} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
              ) : (
                <Eye size={18} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
              )}
            </button>
          </div>
          {password && (
            <div className="mt-2">
              <div className="flex items-center gap-1 mb-1">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 flex-1 rounded-full ${
                      i < passwordStrength 
                        ? passwordStrength < 3 
                          ? 'bg-red-500' 
                          : passwordStrength < 5 
                            ? 'bg-yellow-500' 
                            : 'bg-green-500'
                        : isDark ? 'bg-gray-700' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs">
                {passwordStrength < 3 && <span className="text-red-500">Weak password</span>}
                {passwordStrength >= 3 && passwordStrength < 5 && <span className="text-yellow-500">Medium password</span>}
                {passwordStrength === 5 && <span className="text-green-500">Strong password</span>}
              </p>
            </div>
          )}
          {form.formState.errors.password && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Confirm Password</label>
          <div className="relative">
            <Input 
              {...form.register('confirmPassword')} 
              type={showConfirmPassword ? "text" : "password"} 
              className={`pr-10 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              {showConfirmPassword ? (
                <EyeOff size={18} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
              ) : (
                <Eye size={18} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
              )}
            </button>
          </div>
          {form.formState.errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.confirmPassword.message}</p>
          )}
        </div>

        <div className={`p-3 rounded-md flex items-start gap-3 ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
          <AlertCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-blue-700'}`}>
            For your security, please create a strong password that includes uppercase and lowercase letters, 
            numbers, and special characters.
          </p>
        </div>
        
        <Button 
          type="submit" 
          disabled={isLoading} 
          className="w-full hover:scale-105 transition-all duration-300 hover:shadow-glow"
        >
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </Button>
      </form>
    </motion.div>
  );
};

export default ResetPasswordForm;

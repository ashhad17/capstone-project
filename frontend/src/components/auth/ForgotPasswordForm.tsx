
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

interface ForgotPasswordFormProps {
  onComplete: () => void;
  onCancel: () => void;
}

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onComplete,
  onCancel,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/auth/forgot-password`,
        data
      );

      setSuccess(true);
      toast({
        title: 'Success',
        description: 'If the email exists, you will receive a password reset link.',
      });

      // Redirect after a delay for better UX
      setTimeout(() => {
        onComplete();
      }, 3000);
    } catch (error) {
      // We don't show errors for security reasons, we just say the same message
      toast({
        title: 'Password Reset Requested',
        description: 'If the email exists, you will receive a password reset link.',
      });
      
      // Still redirect after a delay, even if there was an "error"
      setTimeout(() => {
        onComplete();
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full border-none shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Reset Your Password</CardTitle>
        <CardDescription className="text-center">
          Enter your email address and we will send you a link to reset your password
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!success ? (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                {...form.register('email')}
                className="w-full"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="py-4 text-center">
            <div className="mb-4 text-green-600 dark:text-green-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium">Check your email</h3>
            <p className="text-muted-foreground mt-2">
              We've sent a password reset link to your email address if it exists in our system.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="link" onClick={onCancel}>
          Return to login
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ForgotPasswordForm;

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { UserRole } from '@/context/AuthContext';
import { useAuth } from "@/context/AuthContext";
const OTPLoginForm = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { toast } = useToast();
  const { handleVerifyOTP } = useAuth();

  // Timer for resending OTP
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSendOTP = async () => {
    if (!email) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/auth/request-otp`,
        { email }
      );

      toast({
        title: 'OTP Sent',
        description: response.data.message || 'A 6-digit verification code has been sent to your email',
      });

      setTimeLeft(60); // 60-second cooldown
      setStep('otp');

      // Focus the first OTP input when we move to the OTP step
      setTimeout(() => {
        if (otpInputRefs.current[0]) {
          otpInputRefs.current[0].focus();
        }
      }, 100);
    } catch (error: any) {
      toast({
        title: 'Failed to send OTP',
        description: error.response?.data?.message || 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;

    // Allow only one digit per input
    if (value && !/^\d$/.test(value)) {
      return;
    }

    // Update the OTP array
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input if current input is filled
    if (value && index < 5 && otpInputRefs.current[index + 1]) {
      otpInputRefs.current[index + 1].focus();
    }
  };

  const handleSubmit = async () => {

    try {
      await handleVerifyOTP(email, otp.join(''));
      console.log("OTP Login Successful");
    } catch (error) {
      console.error("OTP Login Failed:", error);
    }
  };

  const handleResendOTP = () => {
    if (timeLeft > 0) return;
    handleSendOTP();
  };

  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(1, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {step === 'email' ? (
          <motion.div
            key="email-step"
            className="space-y-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Login with Email</h3>
              <p className="text-sm text-gray-500">
                Enter your email address to receive a one-time verification code
              </p>
            </div>

            <div className="relative">
              <label className="absolute left-3 -top-2.5 bg-white px-1 text-xs text-gray-500">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="example@example.com"
                value={email}
                onChange={handleEmailChange}
                className="pt-4 h-14 border-gray-300"
                disabled={isLoading}
              />
            </div>

            <Button
              type="button"
              onClick={handleSendOTP}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Sending OTP...' : 'Send OTP'}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="otp-step"
            className="space-y-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Verify Email</h3>
              <p className="text-sm text-gray-500">
                Enter the 6-digit code sent to {email}
              </p>
            </div>

            <div className="flex justify-center space-x-2">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (otpInputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOTPChange(e, index)}
                  className="w-12 h-12 text-xl text-center font-bold"
                  disabled={isLoading}
                />
              ))}
            </div>

            <div className="flex flex-col items-center justify-center text-sm">
              <div className="flex items-center text-gray-500">
                {timeLeft > 0 ? (
                  <span>Resend OTP in {formatTimeLeft()}</span>
                ) : (
                  <button
                    className="text-primary hover:underline"
                    onClick={handleResendOTP}
                    disabled={isLoading}
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </div>

            <Button
              type="button"
              onClick={handleSubmit}
              className="w-full"
              disabled={isLoading || otp.join('').length !== 6}
            >
              {isLoading ? 'Verifying...' : 'Verify & Login'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OTPLoginForm;
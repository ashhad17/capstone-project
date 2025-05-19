
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Phone, ArrowRight, Clock } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const OTPLoginForm = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [formattedPhone, setFormattedPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { toast } = useToast();
  
  // Timer for resending OTP
  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timerId = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);
    
    return () => clearInterval(timerId);
  }, [timeLeft]);
  
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedNumber = formatPhoneNumber(e.target.value);
    setFormattedPhone(formattedNumber);
    setPhone(e.target.value.replace(/[^\d]/g, ''));
  };

  const handleSendOTP = async () => {
    if (phone.length < 10) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call to send OTP
      // In a real implementation, this would be an actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "OTP Sent",
        description: "A 6-digit verification code has been sent to your phone",
      });
      
      setTimeLeft(60); // 60 second cooldown
      setStep('otp');
      
      // Focus the first OTP input when we move to the OTP step
      setTimeout(() => {
        if (otpInputRefs.current[0]) {
          otpInputRefs.current[0].focus();
        }
      }, 100);
    } catch (error) {
      toast({
        title: "Failed to send OTP",
        description: "Please try again later",
        variant: "destructive",
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
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0 && otpInputRefs.current[index - 1]) {
      otpInputRefs.current[index - 1].focus();
    }
    
    // Allow navigation with arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };
  
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    
    // Extract only digits and limit to 6 characters
    const digits = pastedData.replace(/[^\d]/g, '').slice(0, 6);
    
    if (!digits) return;
    
    // Fill the OTP inputs with the pasted digits
    const newOtp = [...otp];
    digits.split('').forEach((digit, index) => {
      if (index < 6) newOtp[index] = digit;
    });
    setOtp(newOtp);
    
    // Focus the appropriate input based on pasted data length
    const focusIndex = Math.min(digits.length, 5);
    if (otpInputRefs.current[focusIndex]) {
      otpInputRefs.current[focusIndex].focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpValue = otp.join('');
    
    if (otpValue.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the complete 6-digit verification code",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call to verify OTP
      // In a real implementation, this would be an API call with phone and OTP
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "OTP Verified",
        description: "You have been successfully logged in",
      });
      
      setTimeout(() => {
        onComplete();
      }, 1000);
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Invalid OTP. Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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

  const containerVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {step === 'phone' ? (
          <motion.div
            key="phone-step"
            className="space-y-6"
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <Phone className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Login with Phone Number</h3>
              <p className="text-sm text-gray-500">
                Enter your phone number to receive a one-time verification code
              </p>
            </div>

            <div className="relative">
              <label className="absolute left-3 -top-2.5 bg-white px-1 text-xs text-gray-500">
                Phone Number
              </label>
              <Input
                type="tel"
                placeholder="(123) 456-7890"
                value={formattedPhone}
                onChange={handlePhoneChange}
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
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending OTP...
                </div>
              ) : (
                <div className="flex items-center">
                  Send OTP <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              )}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="otp-step"
            className="space-y-6"
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <span className="text-lg font-bold text-primary">OTP</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Verify Phone Number</h3>
              <p className="text-sm text-gray-500">
                Enter the 6-digit code sent to {formattedPhone}
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
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-12 h-12 text-xl text-center font-bold"
                  disabled={isLoading}
                />
              ))}
            </div>

            <div className="flex flex-col items-center justify-center text-sm">
              <div className="flex items-center text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
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
            
            <div className="space-y-3">
              <Button 
                type="button" 
                onClick={handleVerifyOTP} 
                className="w-full"
                disabled={isLoading || otp.join('').length !== 6}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </div>
                ) : (
                  <div className="flex items-center">
                    Verify & Login
                  </div>
                )}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setStep('phone')} 
                className="w-full"
                disabled={isLoading}
              >
                Change Phone Number
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OTPLoginForm;

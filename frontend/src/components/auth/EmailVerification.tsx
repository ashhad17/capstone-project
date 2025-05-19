import React, { useState } from "react";
import axios from "axios";
import { useParams ,useNavigate} from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const EmailVerification: React.FC = () => {
  const { token } = useParams<{ token: string }>(); // Get the token from the URL params
  const [isVerifying, setIsVerifying] = useState(false);
    const navigate = useNavigate(); // Initialize the navigate function
  const handleVerifyEmail = async () => {
    if (!token) {
      toast({
        title: "Verification Failed",
        description: "No verification token found in the URL.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/v1/auth/verify-email/${token}`
      );

      // Check if the response contains a "message" field
      if (response.data?.message === "Email verified!") {
        toast({
          title: "Email Verified",
          description: "Your email has been successfully verified!",
        });
        navigate("/login"); // Redirect to the login page after successful verification
      } else {
        toast({
          title: "Verification Failed",
          description: response.data?.message || "Failed to verify email.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Email verification error:", error);
      const errorMessage = error.response?.data?.message || "An error occurred during email verification.";
      toast({
        title: "Verification Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Verify Your Email</h1>
        <p className="text-gray-600 mb-6">
          Click the button below to verify your email address.
        </p>
        <Button onClick={handleVerifyEmail} disabled={isVerifying}>
          {isVerifying ? "Verifying..." : "Verify Email"}
        </Button>
      </div>
    </div>
  );
};

export default EmailVerification;
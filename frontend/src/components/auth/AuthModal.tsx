
import React, { useState } from "react";
import Modal from "@/components/ui/modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "./LoginForm";
import SignUpForm from "./SignUpForm";
import OTPLoginForm from "./OTPLoginForm";
import ForgotPasswordForm from "./ForgotPasswordForm";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultView?: "login" | "signup";
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  defaultView = "login" 
}) => {
  const [activeTab, setActiveTab] = useState<"login" | "signup">(defaultView);
  const [authView, setAuthView] = useState<"tabs" | "otp" | "forgot-password">("tabs");
  
  // Reset to default views when modal is closed
  const handleClose = () => {
    onClose();
    // Reset with a slight delay to prevent visible UI changes during closing animation
    setTimeout(() => {
      setAuthView("tabs");
      setActiveTab(defaultView);
    }, 300);
  };
  
  const handleComplete = () => {
    handleClose();
  };
  
  const getTitle = () => {
    if (authView === "otp") return "Login with OTP";
    if (authView === "forgot-password") return "Reset Password";
    return activeTab === "login" ? "Login" : "Sign Up";
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={getTitle()}
      size="md"
    >
      <div className="p-6">
        {authView === "tabs" && (
          <div>
            <Tabs 
              defaultValue={activeTab} 
              onValueChange={(value) => setActiveTab(value as "login" | "signup")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <LoginForm 
                  onComplete={handleComplete} 
                  onForgotPassword={() => setAuthView("forgot-password")}
                  onOtpLogin={() => setAuthView("otp")}
                />
              </TabsContent>
              
              <TabsContent value="signup">
                <SignUpForm 
                  onComplete={handleComplete}
                  onCancel={handleClose}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
        
        {authView === "otp" && (
          <div>
            <div className="mb-4">
              <button 
                onClick={() => setAuthView("tabs")}
                className="text-sm text-primary hover:underline flex items-center"
              >
                ← Back to login options
              </button>
            </div>
            
            <OTPLoginForm onComplete={handleComplete} />
          </div>
        )}
        
        {authView === "forgot-password" && (
          <div>
            <ForgotPasswordForm 
              onComplete={handleComplete}
              onCancel={() => setAuthView("tabs")}
            />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AuthModal;

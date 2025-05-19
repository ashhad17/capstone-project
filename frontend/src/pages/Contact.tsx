
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Mail, Phone, MapPin, Send } from "lucide-react";

type FormValues = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
  
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/auth/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      if (response.ok) {
        toast({
          title: "Message Sent!",
          description: "We've received your message and will get back to you shortly.",
        });
        reset();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to send your message. Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error sending contact form:', error);
      toast({
        title: "Error",
        description: "Failed to send your message. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <>
      <Helmet>
        <title>Contact Us | WheelsTrust</title>
      </Helmet>
      
      <Navbar />
      
      <main className="pt-24 pb-16 min-h-screen flex items-center bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 slide-up animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Get In Touch</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Have questions or feedback? We'd love to hear from you. Fill out the form below
                and our team will get back to you as soon as possible.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Contact Form */}
              <Card className="overflow-hidden glow-card animate-fade-in">
                <CardContent className="p-6 md:p-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Send us a message
                  </h2>
                  
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                      <Input
                        placeholder="Your Name"
                        {...register("name", { required: "Name is required" })}
                        className={errors.name ? "border-red-500" : ""}
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <Input
                        type="email"
                        placeholder="Email Address"
                        {...register("email", {
                          required: "Email is required",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address",
                          },
                        })}
                        className={errors.email ? "border-red-500" : ""}
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <Input
                        placeholder="Subject"
                        {...register("subject", { required: "Subject is required" })}
                        className={errors.subject ? "border-red-500" : ""}
                      />
                      {errors.subject && (
                        <p className="mt-1 text-sm text-red-500">{errors.subject.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <Textarea
                        placeholder="Your Message"
                        rows={5}
                        {...register("message", { required: "Message is required" })}
                        className={errors.message ? "border-red-500" : ""}
                      />
                      {errors.message && (
                        <p className="mt-1 text-sm text-red-500">{errors.message.message}</p>
                      )}
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full hover-scale" 
                      variant="glow"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : "Send Message"}
                      <Send className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
              
              {/* Contact Info */}
              <div className="space-y-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <Card className="overflow-hidden glow-card">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-medium mb-4">Contact Information</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <Mail className="h-5 w-5 mr-3 text-primary flex-shrink-0 mt-1" />
                        <div>
                          <p className="font-medium">Email</p>
                          <a href="mailto:support@wheelstrust.com" className="text-muted-foreground hover:text-primary transition-colors">
                            support@wheelstrust.com
                          </a>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Phone className="h-5 w-5 mr-3 text-primary flex-shrink-0 mt-1" />
                        <div>
                          <p className="font-medium">Phone</p>
                          <a href="tel:+18001234567" className="text-muted-foreground hover:text-primary transition-colors">
                            +1 (800) 123-4567
                          </a>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 mr-3 text-primary flex-shrink-0 mt-1" />
                        <div>
                          <p className="font-medium">Office</p>
                          <address className="not-italic text-muted-foreground">
                            123 Automotive Drive<br />
                            San Francisco, CA 94107<br />
                            United States
                          </address>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="overflow-hidden glow-card">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-medium mb-4">Business Hours</h3>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Monday - Friday</span>
                        <span className="font-medium">9:00 AM - 6:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Saturday</span>
                        <span className="font-medium">10:00 AM - 4:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sunday</span>
                        <span className="font-medium">Closed</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="overflow-hidden glow-card bg-primary text-primary-foreground">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-medium mb-3">Need urgent help?</h3>
                    <p className="mb-4">Our premium support team is available 24/7 for emergencies.</p>
                    <Button variant="secondary" className="w-full hover-scale">
                      Call Emergency Support
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="mt-16 text-center animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <h2 className="text-2xl font-bold mb-4">Feedback & Suggestions</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
                We're constantly improving our services based on your valuable feedback.
                If you have any suggestions for how we can improve, please let us know!
              </p>
              <Button variant="outline" className="hover-scale">Submit Feedback</Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default Contact;

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CarGrid from "@/components/car/CarGrid";
import AuthModal from "@/components/auth/AuthModal";
import { Helmet } from "react-helmet-async";

const Cars = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Browse Cars | WheelsTrust</title>
      </Helmet>
      <Navbar />
      <main className="flex-grow pt-24 pb-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Browse Vehicles
            </h1>
            <p className="text-gray-600 max-w-3xl">
              Explore our selection of verified vehicles from trusted sellers. 
              Each listing has been checked for accuracy and comes with 
              transparent pricing and history.
            </p>
          </div>
          
          {/* Use CarGrid without providing cars - it will fetch them from the API */}
          <CarGrid />
        </div>
      </main>
      <Footer />
      {/* AuthModal is now provided through AuthModalProvider */}
    </div>
  );
};

export default Cars;

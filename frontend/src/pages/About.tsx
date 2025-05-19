import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuthModal from "@/components/auth/AuthModal";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext"; // Import useTheme hook

const About = () => {
  const { isDark } = useTheme(); // Use isDark from ThemeContext

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero section */}
          <div className="mb-16 text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About <span className="text-gradient">WheelsTrust</span>
            </h1>
            <p className={`text-lg ${isDark ? "text-gray-300" : "text-gray-600"}`}>
              We're on a mission to bring transparency and trust to the automotive industry.
              Our platform connects vehicle owners with reliable buyers and trusted service providers.
            </p>
          </div>

          {/* Our Story */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h2 className="text-3xl font-bold mb-4">Our Story</h2>
              <p className={`${isDark ? "text-gray-300" : "text-gray-600"} mb-4`}>
                WheelsTrust was founded in 2023 by a team of automotive enthusiasts who were frustrated by the lack of transparency in car buying, selling, and servicing.
              </p>
              <p className={`${isDark ? "text-gray-300" : "text-gray-600"} mb-4`}>
                After experiencing numerous challenges with hidden fees, misleading listings, and unpredictable service costs, we decided to create a platform that puts honesty and transparency first.
              </p>
              <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
                Today, WheelsTrust is helping thousands of vehicle owners make informed decisions about their cars with confidence and peace of mind.
              </p>
            </div>
            <div className="order-first md:order-last">
              <img
                src="https://images.unsplash.com/photo-1552960394-c81add8de6b8?q=80&w=2070&auto=format&fit=crop"
                alt="Team working together"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>

          {/* Our Values */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold mb-8 text-center">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Transparency",
                  description: "We believe in complete honesty in pricing, vehicle history, and service quality. No hidden fees, no surprises.",
                  icon: (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ),
                },
                {
                  title: "Trust",
                  description: "We build trust through verification, reviews, and a community of honest users committed to fair dealings.",
                  icon: (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  ),
                },
                {
                  title: "Innovation",
                  description: "We're constantly improving our platform to make car ownership easier, more affordable, and more enjoyable.",
                  icon: (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  ),
                },
              ].map((value, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-lg shadow-md ${isDark ? "bg-gray-800" : "bg-white"}`}
                >
                  <div className={`rounded-full w-12 h-12 flex items-center justify-center mb-4 ${isDark ? "bg-primary/20" : "bg-primary/10"}`}>
                    <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {value.icon}
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>{value.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  title: "Create an Account",
                  description: "Sign up for free and complete your profile to start buying, selling, or booking services.",
                },
                {
                  step: "2",
                  title: "Browse Listings",
                  description: "Search for vehicles or services that match your needs with our powerful filters.",
                },
                {
                  step: "3",
                  title: "Connect & Transact",
                  description: "Connect with sellers or service providers and complete your transaction with confidence.",
                },
              ].map((step, index) => (
                <div key={index} className="text-center">
                  <div className={`rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 ${isDark ? "bg-primary text-white" : "bg-primary text-white"}`}>
                    <span className="font-bold">{step.step}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className={`rounded-2xl p-8 md:p-12 text-white ${isDark ? "bg-gradient-to-r from-primary to-blue-600" : "bg-gradient-to-r from-primary to-blue-600"}`}>
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">
                Ready to transform your car experience?
              </h2>
              <p className="mb-8">
                Join thousands of satisfied users who have found a better way to buy, sell, and service their vehicles.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/cars">
                  <Button className="bg-white text-primary hover:bg-gray-100">
                    Browse Vehicles
                  </Button>
                </Link>
                <Link to="/services">
                  <Button className="bg-white text-primary hover:bg-gray-100">
                    Find Services
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;

import React from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ServicesList from "@/components/services/ServicesList";
import ServiceFilters from "@/components/services/ServiceFilters";
import { useTheme } from "@/context/ThemeContext";
import { motion } from "framer-motion";

const Services = () => {
  const [activeCategory, setActiveCategory] = React.useState("all");
  const { isDark } = useTheme();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Automotive Services | WheelsTrust</title>
        <meta name="description" content="Browse our comprehensive automotive services including maintenance, repairs, detailing, and inspections." />
      </Helmet>
      <Navbar />
      <main className={`flex-grow pt-24 pb-16 ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Automotive <span className="text-primary">Services</span>
            </h1>
            <p className={`max-w-3xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Explore our comprehensive range of automotive services designed to keep your vehicle in optimal condition. 
              From routine maintenance to specialized repairs, our skilled professionals have got you covered.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <div className="md:col-span-1">
              <ServiceFilters onFilterChange={setActiveCategory} activeFilter={activeCategory} />
            </div>
            
            <div className="md:col-span-3">
              <Tabs defaultValue="all" className="w-full" onValueChange={setActiveCategory} value={activeCategory}>
                <TabsList className={`grid grid-cols-6 mb-8 ${isDark ? 'bg-gray-800' : ''}`}>
                  <TabsTrigger 
                    value="all"
                    className={isDark ? 'data-[state=active]:bg-gray-700' : ''}
                  >All</TabsTrigger>
                  <TabsTrigger 
                    value="maintenance"
                    className={isDark ? 'data-[state=active]:bg-gray-700' : ''}
                  >Maintenance</TabsTrigger>
                  <TabsTrigger 
                    value="repair"
                    className={isDark ? 'data-[state=active]:bg-gray-700' : ''}
                  >Repair</TabsTrigger>
                  <TabsTrigger 
                    value="inspection"
                    className={isDark ? 'data-[state=active]:bg-gray-700' : ''}
                  >Inspection</TabsTrigger>
                  <TabsTrigger 
                    value="cleaning"
                    className={isDark ? 'data-[state=active]:bg-gray-700' : ''}
                  >Cleaning</TabsTrigger>
                   <TabsTrigger 
                    value="other"
                    className={isDark ? 'data-[state=active]:bg-gray-700' : ''}
                  >Other</TabsTrigger>
                </TabsList>
                <TabsContent value="all">
                  <ServicesList category={null} />
                </TabsContent>
                <TabsContent value="maintenance">
                  <ServicesList category="maintenance" />
                </TabsContent>
                <TabsContent value="repair">
                  <ServicesList category="repair" />
                </TabsContent>
                <TabsContent value="inspection">
                  <ServicesList category="inspection" />
                </TabsContent>
                <TabsContent value="cleaning">
                  <ServicesList category="cleaning" />
                </TabsContent>
                <TabsContent value="other">
                  <ServicesList category="other" />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Services;

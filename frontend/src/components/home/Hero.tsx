
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { motion } from "framer-motion";

const Hero = () => {
  const { isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const handleBuyCar = () => {
    navigate("/cars/buy");
  };

  const handleSellCar = () => {
    if (isAuthenticated) {
      navigate("/cars/sell");
    } else {
      navigate("/login");
    }
  };

  const handleFindCar = () => {
    navigate("/find-your-car");
  };

  return (
    <section className={`relative min-h-screen pt-16 pb-24 md:py-48 overflow-hidden ${
      isDark ? 'bg-gradient-to-b from-gray-900/50 to-black/80' : 'bg-gradient-to-b from-primary/5 to-transparent'
    }`}>
      
      {/* Dynamic background elements */}
      <div className="absolute top-20 right-0 w-3/4 h-3/4 opacity-10">
        <motion.div 
          className={`absolute rounded-full ${isDark ? 'bg-blue-500' : 'bg-primary'} w-96 h-96 blur-3xl -top-20 -right-20`}
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.7, 0.4]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        ></motion.div>
        <motion.div 
          className={`absolute rounded-full ${isDark ? 'bg-purple-500' : 'bg-accent'} w-64 h-64 blur-3xl bottom-10 left-10`}
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 1
          }}
        ></motion.div>
      </div>

      <div className="container mx-auto px-4 py-20 z-10 relative">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <motion.div 
            className="max-w-xl md:mr-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
              <span className={`${isDark ? 'bg-gradient-to-r from-blue-400 to-purple-500' : 'text-gradient'} bg-clip-text text-transparent`}>
                The smarter way
              </span>
              <br />
              to buy, sell & service your car
            </h1>
            <motion.p 
              className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-8`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              A transparent marketplace built on trust, connecting vehicle owners with reliable buyers and trusted service providers.
            </motion.p>
          </motion.div>
          
          <motion.div 
            className="hidden md:block relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.img
              src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=2070&auto=format&fit=crop"
              alt="Car hero"
              className="rounded-lg shadow-2xl"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
            
            <motion.div 
              className={`absolute -bottom-5 -left-5 ${isDark ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow-lg`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center">
                <div className={`${isDark ? 'bg-green-900/30' : 'bg-green-100'} p-2 rounded-full mr-3`}>
                  <svg className={`h-6 w-6 ${isDark ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Verified Sellers</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>100% transparency & trust</p>
                </div>
              </div>
            </motion.div>

            {/* Animated geometric shapes instead of cars */}
            <motion.div 
              className="absolute -top-10 -right-16 w-24 h-24" 
              animate={{ 
                y: [0, -15, 0],
                rotate: [0, 5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 6,
                repeat: Infinity,
                repeatType: "reverse" 
              }}
            >
              <div className={`w-full h-full rounded-full ${isDark ? 'bg-blue-500/20' : 'bg-blue-300/30'} backdrop-blur-sm border border-white/10`}></div>
            </motion.div>

            <motion.div 
              className="absolute -bottom-10 right-20 w-16 h-16"
              animate={{ 
                y: [0, 10, 0],
                rotate: [0, -8, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse",
                delay: 1 
              }}
            >
              <div className={`w-full h-full rounded-md transform rotate-45 ${isDark ? 'bg-purple-500/20' : 'bg-purple-300/30'} backdrop-blur-sm border border-white/10`}></div>
            </motion.div>
            
            <motion.div 
              className="absolute top-20 right-32 w-12 h-12"
              animate={{ 
                y: [0, -8, 0],
                rotate: [0, 15, 0],
                scale: [1, 0.9, 1]
              }}
              transition={{ 
                duration: 7,
                repeat: Infinity,
                repeatType: "reverse",
                delay: 2 
              }}
            >
              <div className={`w-full h-full rounded-lg transform ${isDark ? 'bg-green-500/20' : 'bg-green-300/30'} backdrop-blur-sm border border-white/10`}></div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 text-center">
        <motion.h1 
          className="text-4xl md:text-6xl font-bold mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Find Your Perfect Car Match
        </motion.h1>
        <motion.p 
          className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto mb-8`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          WheelsTrust connects you with trusted sellers and verified vehicles.
          Buy, sell, or service your car with confidence.
        </motion.p>

        <motion.div 
          className="flex flex-col sm:flex-row justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleBuyCar}
              size="lg"
              variant="glow"
              className="bg-primary hover:bg-primary/90 text-white"
            >
              Browse Cars
            </Button>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={handleSellCar} size="lg" variant="outline" className="glow-btn">
              Sell Your Car
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={handleFindCar} size="lg" variant="secondary" className="glow-btn">
              Find Your Match
            </Button>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Replace car silhouette with animated wave/line */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden h-10 z-10">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full h-full">
          <motion.path 
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
            fill={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: 1, 
              opacity: 1,
              x: [0, -20, 0],
              y: [0, 2, 0]
            }}
            transition={{ 
              pathLength: { duration: 2, ease: "easeInOut" },
              opacity: { duration: 0.5 },
              x: { duration: 10, repeat: Infinity, repeatType: "reverse" },
              y: { duration: 8, repeat: Infinity, repeatType: "reverse" }
            }}
          />
        </svg>
      </div>
      
      {/* Add animated gradient line */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-to-r from-transparent via-primary to-transparent"
          animate={{
            x: ["-100%", "100%"]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>
    </section>
  );
};

export default Hero;

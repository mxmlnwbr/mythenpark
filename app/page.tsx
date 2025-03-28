"use client"

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { motion, useInView } from "framer-motion";

// Define snowflake type
interface Snowflake {
  id: number;
  size: number;
  left: string;
  animationDuration: string;
  animationDelay: string;
}

// Stats data
const statsData = [
  { label: "Obstacles", value: 25 },
  { label: "Team Members", value: 15 },
  { label: "Events per year", value: 7 },
  { label: "Working hours per year", value: 2300 },
];

// CountUp component
const CountUp = ({ end, duration = 2 }: { end: number; duration?: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  useEffect(() => {
    if (!isInView) return;
    
    let startTime: number;
    let animationFrame: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration, isInView]);
  
  return <div ref={ref}>{count}</div>;
};

export default function Home() {
  const [isActive, setIsActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [pulseEffect, setPulseEffect] = useState(true);
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Set up pulse animation interval for mobile
  useEffect(() => {
    if (!isMobile) return;
    
    const pulseInterval = setInterval(() => {
      setPulseEffect(prev => !prev);
    }, 2000);
    
    return () => clearInterval(pulseInterval);
  }, [isMobile]);

  // Generate random snowflakes on client-side only
  useEffect(() => {
    const flakes: Snowflake[] = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      size: Math.random() * 10 + 5,
      left: `${Math.random() * 100}%`,
      animationDuration: `${Math.random() * 10 + 10}s`,
      animationDelay: `${Math.random() * 5}s`,
    }));
    setSnowflakes(flakes);
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden bg-gradient-to-b from-blue-50 to-white">
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none">
          {snowflakes.map((flake) => (
            <div
              key={flake.id}
              className="absolute rounded-full bg-white opacity-80"
              style={{
                width: `${flake.size}px`,
                height: `${flake.size}px`,
                left: flake.left,
                top: '-20px',
                animation: `snowfall ${flake.animationDuration} linear ${flake.animationDelay} infinite`,
                boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
              }}
            />
          ))}
        </div>
        
        <div className="flex flex-col items-center justify-center py-12 px-4 md:py-16 lg:py-24 max-w-7xl mx-auto">
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative mb-12 lg:mb-16"
          >
            <motion.div
              animate={{ 
                rotate: [0, 2, 0, -2, 0],
                scale: [1, 1.02, 1, 1.02, 1]
              }}
              transition={{ 
                duration: 5, 
                ease: "easeInOut", 
                repeat: Infinity,
                repeatType: "reverse" 
              }}
            >
              <Image
                src="/Mythenpark-Logo.jpg"
                alt="Mythenpark logo"
                width={isMobile ? 250 : 300}
                height={isMobile ? 250 : 300}
                className="rounded-lg shadow-xl lg:w-[350px] lg:h-[350px]"
                priority
                sizes="(max-width: 768px) 250px, (max-width: 1024px) 300px, 350px"
              />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="absolute -bottom-4 -right-4 bg-white/90 px-3 py-1 rounded-full shadow-lg text-sm md:text-base lg:text-lg font-semibold text-gray-800 lg:-bottom-5 lg:-right-5 lg:px-4 lg:py-2"
            >
              In shape since 1998
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-center mb-10 lg:mb-16"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-800 mb-3 lg:mb-6">Welcome to Mythenpark</h1>
            <p className="text-lg md:text-xl lg:text-2xl text-gray-600 max-w-md lg:max-w-2xl mx-auto">Experience the thrill of adventure in one of Switzerland's most beautiful mountain parks.</p>
          </motion.div>
          
          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.5 }}
            className="w-full max-w-4xl lg:max-w-6xl mb-12 lg:mb-20"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 lg:gap-12">
              {statsData.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.2 + index * 0.2, duration: 0.5 }}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 lg:p-8 shadow-lg text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  whileHover={{ scale: 1.03 }}
                >
                  <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-blue-600 mb-2 lg:mb-4">
                    <CountUp end={stat.value} />
                  </div>
                  <div className="text-sm md:text-base lg:text-lg font-medium text-gray-700">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          <motion.div 
            className="flex flex-col md:flex-row gap-4 mb-8 lg:gap-6 lg:mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.5 }}
          >
            <motion.a 
              href="/events" 
              className="px-6 py-3 md:px-8 md:py-4 lg:text-lg bg-blue-600 text-white rounded-full font-semibold shadow-lg hover:bg-blue-700 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Explore Events
            </motion.a>
            <motion.a 
              href="/park-info" 
              className="px-6 py-3 md:px-8 md:py-4 lg:text-lg bg-white text-gray-800 rounded-full font-semibold shadow-lg hover:bg-gray-100 transition-all duration-300 border border-gray-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Park Information
            </motion.a>
          </motion.div>
          
          <motion.a 
            href="https://www.instagram.com/mythenpark"
            target="_blank"
            className={`flex items-center justify-center px-6 py-3 mt-6 lg:px-8 lg:py-4 lg:mt-8 rounded-full transition-all duration-500 ${pulseEffect ? 'scale-105' : 'scale-100'}`}
            style={{
              background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
              boxShadow: pulseEffect ? '0 0 15px rgba(220, 39, 67, 0.7)' : '0 0 5px rgba(220, 39, 67, 0.3)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.0, duration: 0.5 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsActive(true)}
            onMouseEnter={() => setIsActive(true)}
            onMouseLeave={() => setIsActive(false)}
          >
            <div className="mr-2 lg:mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" className="lg:w-7 lg:h-7">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>
            <span className="text-white font-bold text-lg lg:text-xl">Follow us</span>
          </motion.a>
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes snowfall {
          0% {
            transform: translateY(-20px) rotate(0deg);
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
          }
        }
        
        @media (min-width: 1280px) {
          @keyframes snowfall {
            0% {
              transform: translateY(-50px) rotate(0deg);
            }
            100% {
              transform: translateY(120vh) rotate(360deg);
            }
          }
        }
      `}</style>
    </>
  );
}

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
  const [parkStatus, setParkStatus] = useState<{ status: 'open' | 'closed'; message?: string | null }>({ status: 'closed' });
  const videoRef = useRef<HTMLVideoElement>(null);

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

  // Fetch park status
  useEffect(() => {
    async function fetchParkStatus() {
      try {
        const response = await fetch('/api/park-status');
        const data = await response.json();
        setParkStatus(data);
      } catch (error) {
        console.error('Error fetching park status:', error);
      }
    }
    
    fetchParkStatus();
    
    // Refresh status every 5 minutes
    const interval = setInterval(fetchParkStatus, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      
      {/* Video Hero Section */}
      <div className="relative w-full h-screen overflow-hidden bg-black">
        <div className="absolute inset-0 overflow-hidden">
          <iframe
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-0"
            style={{
              width: '100vw',
              height: '56.25vw', // 16:9 aspect ratio
              minHeight: '100vh',
              minWidth: '177.77vh', // 16:9 aspect ratio
              pointerEvents: 'none',
            }}
            src="https://www.youtube.com/embed/7bn2SISTcbY?autoplay=1&mute=1&loop=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&end=270"
            title="Mythenpark Hero Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/30 pointer-events-none z-0" />
        
        {/* Park Status Badge - Top Right */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="absolute top-6 right-6 z-10"
        >
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl backdrop-blur-md shadow-lg border-2 ${
            parkStatus.status === 'open' 
              ? 'bg-green-500/90 border-green-300 text-white' 
              : 'bg-red-500/90 border-red-300 text-white'
          }`}>
            <div className={`w-3 h-3 rounded-full ${
              parkStatus.status === 'open' ? 'bg-white animate-pulse' : 'bg-white'
            }`} />
            <div className="flex flex-col">
              <span className="font-bold text-sm md:text-base uppercase tracking-wide">
                {parkStatus.status === 'open' ? 'Park Open' : 'Park Closed'}
              </span>
              {parkStatus.message && (
                <span className="text-xs opacity-90">{parkStatus.message}</span>
              )}
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Logo Section */}
      <div className="w-full bg-gradient-to-b from-[#e5e9fd] to-[#e5e9fd] py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-12 lg:mb-16"
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-magenta-600 mb-2">Our Partners</h2>
            <p className="text-gray-600 text-sm md:text-base">Trusted by leading organizations</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12 items-center justify-center"
          >
            {/* Logo placeholders - replace with actual logo images */}
            <div className="flex items-center justify-center h-20 lg:h-24">
              <div className="text-gray-400 text-sm font-semibold">Logo 1</div>
            </div>
            <div className="flex items-center justify-center h-20 lg:h-24">
              <div className="text-gray-400 text-sm font-semibold">Logo 2</div>
            </div>
            <div className="flex items-center justify-center h-20 lg:h-24">
              <div className="text-gray-400 text-sm font-semibold">Logo 3</div>
            </div>
            <div className="flex items-center justify-center h-20 lg:h-24">
              <div className="text-gray-400 text-sm font-semibold">Logo 4</div>
            </div>
            <div className="flex items-center justify-center h-20 lg:h-24">
              <div className="text-gray-400 text-sm font-semibold">Logo 5</div>
            </div>
            <div className="flex items-center justify-center h-20 lg:h-24">
              <div className="text-gray-400 text-sm font-semibold">Logo 6</div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Main Content Section */}
      <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-[#e5e9fd] via-[#e5e9fd] to-white">
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
                sizes="(max-width: 768px) 250px, (max-width: 1024px) 300px, 350px"
              />
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-center mb-10 lg:mb-16"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-magenta-600 mb-3 lg:mb-6">About Mythenpark</h1>
            <p className="text-lg md:text-xl lg:text-2xl text-cyan-600 max-w-md lg:max-w-2xl mx-auto">Discover what makes us special - a mountain park dedicated to adventure and community.</p>
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
                  className="bg-white/90 backdrop-blur-sm rounded-xl p-6 lg:p-8 shadow-lg text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-purple-100"
                  whileHover={{ scale: 1.03 }}
                >
                  <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-magenta-600 mb-2 lg:mb-4">
                    <CountUp end={stat.value} />
                  </div>
                  <div className="text-sm md:text-base lg:text-lg font-medium text-gray-700">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* In Shape Since 1998 Section */}
      <div className="w-full bg-white py-16 lg:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black text-[#e604ff] tracking-tight">
              IN SHAPE SINCE 1998
            </h2>
          </motion.div>
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

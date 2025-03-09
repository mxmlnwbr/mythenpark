"use client"

import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <a 
        target="_blank" 
        href="https://www.instagram.com/mythenpark"
        className="relative overflow-hidden transition-transform duration-300 ease-in-out shadow-lg hover:shadow-xl"
        style={{
          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative">
          <Image
            src="/Mythenpark-Logo.jpg"
            alt="Mythenpark logo"
            width={300}
            height={300}
            className=""
          />
          <div 
            className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300"
          >
            <span className="text-white font-bold text-lg">Visit Instagram</span>
          </div>
        </div>
      </a>
    </div>
  );
}

"use client"

import Image from "next/image";
import { useEffect, useState } from "react";

// Define interface for component props
interface AutoRefreshImageProps {
  src: string;
  refreshTime?: number;
  caption?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

// Component for auto-refreshing images
const AutoRefreshImage = ({ src, refreshTime = 60, caption, align = "center", className }: AutoRefreshImageProps) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // Add a timestamp or random parameter to force refresh
      const timestamp = new Date().getTime();
      setImageSrc(`${src}?t=${timestamp}`);
      setKey(prev => prev + 1);
    }, refreshTime * 1000);

    return () => clearInterval(interval);
  }, [src, refreshTime]);

  return (
    <div className={`my-4 text-${align}`}>
      <img 
        key={key}
        src={imageSrc}
        alt={caption || "Webcam image"}
        width={800}
        height={450}
        className={`${className} mx-auto rounded-lg shadow-md w-full max-w-3xl h-auto`}
      />
      {caption && <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{caption}</p>}
    </div>
  );
};

export default function ParkInfo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-4xl font-bold mb-6 text-magenta-600">PARK INFO</h1>

        <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-cyan-200">
          <h2 className="text-2xl font-bold mb-2 text-magenta-600">Season Over</h2>
          <p className="text-cyan-600 font-semibold mb-2">10. März 2025 </p>
          <p className="mb-6 text-cyan-700">Jetzt wird güsled, g'hagged und de öpe eisch s'Veh uslah. Adé merci – mer wünsched en schöne Summer.</p>
        </div>

        <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-magenta-200">
          <h2 className="text-2xl font-bold mb-2 text-magenta-600">Lift-Flips:</h2>
          <p className="mb-6 text-cyan-700">
            Aufgrund mehreren defekten Liftbügel werden keine «Lift-Flips» oder andere Spielereien mehr am Lift toleriert. 
            Den Ersatz eines solchen Bügel ist kostenintensiv – bei nicht einhalten muss mit einem Ticketentzug gerechnet werden. 
            Dafür ist das Aussteigen beim Parkeingang nach wie vor erlaubt.
          </p>
        </div>

        <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-cyan-200">
          <h2 className="text-2xl font-bold mb-2 text-magenta-600">Falls geschlossen:</h2>
          <p className="mb-6 text-cyan-700">
            Wenn der Park geschlossen ist, tolerieren wir keine Ausnahmen und verlangen, dass sich alle an die Absperrung halten. 
            Arbeiten mit dem Pistenbully bergen eine erhebliche Unfallgefahr. Geschlossen bedeutet betreten für alle verboten. 
            Danke fürs Verständnis.
          </p>
        </div>

        <div className="mb-8 bg-gradient-to-r from-magenta-50 to-cyan-50 rounded-lg p-6 border-2 border-magenta-200">
          <p className="font-semibold italic text-magenta-600">Euer Mythenpark Team – In shape since 1998</p>
        </div>

        <h2 className="text-2xl font-bold mb-4 text-magenta-600">Webcam</h2>
        <div className="flex flex-col md:flex-row gap-6 mb-8 justify-center">
          
          <AutoRefreshImage 
            src="https://webcams.twwc.ch/mythenregion/livecammythenregion8.jpg?1741630070986" 
            refreshTime={60} 
            caption="" 
            align="center" 
            className="w-full"
          />
          
          <AutoRefreshImage 
            src="https://webcams.twwc.ch/mythenregion/livecammythenregion2.jpg?1741630379356" 
            refreshTime={60} 
            caption="" 
            align="center" 
            className="w-full"
          />
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2 text-magenta-600">Standart Park Aufbau</h2>
          <div className="flex justify-center mt-4">
            <img 
              src="/park.jpg" 
              alt="Standart Park Aufbau" 
              className="rounded-lg shadow-md max-w-full h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

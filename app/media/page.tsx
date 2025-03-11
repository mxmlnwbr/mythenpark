"use client"

import Image from "next/image";
import { useState } from "react";

// Define the media item type
type MediaItem = {
  id: number;
  src: string;
  alt: string;
  type: "image" | "video";
  category: "events" | "park" | "people" | "nature";
};

export default function MediaPage() {
  // Sample media items based on the shared image
  const mediaItems: MediaItem[] = [
    {
      id: 1,
      src: "/Mythenpark-Logo.jpg",
      alt: "Event with people in snow",
      type: "image",
      category: "events"
    },
    {
      id: 2,
      src: "/Mythenpark-Logo.jpg",
      alt: "Snowboarder silhouette at sunset",
      type: "image",
      category: "people"
    },
    {
      id: 3,
      src: "/Mythenpark-Logo.jpg",
      alt: "Person giving peace sign in snow",
      type: "image",
      category: "people"
    },
    {
      id: 4,
      src: "/Mythenpark-Logo.jpg",
      alt: "Transport vehicle in mountains",
      type: "image",
      category: "park"
    },
    {
      id: 5,
      src: "/Mythenpark-Logo.jpg",
      alt: "Ski slopes with people",
      type: "image",
      category: "park"
    },
    {
      id: 6,
      src: "/Mythenpark-Logo.jpg",
      alt: "Winter landscape",
      type: "image",
      category: "nature"
    },
    {
      id: 7,
      src: "/Mythenpark-Logo.jpg",
      alt: "Snowboarding competition",
      type: "image",
      category: "events"
    },
    {
      id: 8,
      src: "/Mythenpark-Logo.jpg",
      alt: "Snow park obstacles",
      type: "image",
      category: "park"
    }
  ];

  // State for filtering
  const [activeCategory, setActiveCategory] = useState<string>("all");
  
  // Filter media items based on active category
  const filteredItems = activeCategory === "all" 
    ? mediaItems 
    : mediaItems.filter(item => item.category === activeCategory);

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-4xl font-bold mb-8">Media</h1>
        
        {/* Category filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button 
            className={`px-4 py-2 rounded-md ${activeCategory === "all" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
            onClick={() => setActiveCategory("all")}
          >
            All
          </button>
          <button 
            className={`px-4 py-2 rounded-md ${activeCategory === "events" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
            onClick={() => setActiveCategory("events")}
          >
            Events
          </button>
          <button 
            className={`px-4 py-2 rounded-md ${activeCategory === "park" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
            onClick={() => setActiveCategory("park")}
          >
            Park
          </button>
          <button 
            className={`px-4 py-2 rounded-md ${activeCategory === "people" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
            onClick={() => setActiveCategory("people")}
          >
            People
          </button>
          <button 
            className={`px-4 py-2 rounded-md ${activeCategory === "nature" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
            onClick={() => setActiveCategory("nature")}
          >
            Nature
          </button>
        </div>
        
        {/* Media grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="relative h-64">
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4 bg-white dark:bg-gray-800">
                <p className="text-gray-700 dark:text-gray-300">{item.alt}</p>
                <span className="inline-block px-2 py-1 mt-2 text-xs font-semibold bg-gray-200 dark:bg-gray-700 rounded-md">
                  {item.category}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Empty state */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 dark:text-gray-400">No media items found for this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}

"use client"

import { useState, useEffect } from 'react';

// Define event type
type Event = {
  id: number;
  title: string;
  date: string;
  description: string;
  imageUrl: string;
  category: 'competition' | 'workshop' | 'special';
  featured: boolean;
};

export default function EventsPage() {
  // Sample event data
  const events: Event[] = [
    {
      id: 1,
      title: "Winter Snowboard Championship",
      date: "December 15, 2025",
      description: "Join us for the annual snowboard championship with professional riders from all over Switzerland. Spectacular jumps, amazing tricks, and great atmosphere guaranteed!",
      imageUrl: "/Mythenpark-Logo.jpg",
      category: "competition",
      featured: true
    },
    {
      id: 2,
      title: "Freestyle Workshop with Pro Riders",
      date: "January 20, 2026",
      description: "Learn from the best! Our pro riders will teach you advanced freestyle techniques, from basic jumps to complex aerial maneuvers. All skill levels welcome.",
      imageUrl: "/Mythenpark-Logo.jpg",
      category: "workshop",
      featured: false
    },
    {
      id: 3,
      title: "Night Ride Special",
      date: "February 5, 2026",
      description: "Experience Mythenpark under the stars! Our special night ride event includes illuminated obstacles, hot drinks, and music. A magical winter experience you won't forget.",
      imageUrl: "/Mythenpark-Logo.jpg",
      category: "special",
      featured: true
    },
    {
      id: 4,
      title: "Kids Snow Day",
      date: "February 12, 2026",
      description: "A fun day dedicated to our youngest snow enthusiasts! Child-friendly obstacles, games, and professional instructors to help kids improve their skills while having fun.",
      imageUrl: "/Mythenpark-Logo.jpg",
      category: "special",
      featured: false
    },
    {
      id: 5,
      title: "Spring Jam Competition",
      date: "March 20, 2026",
      description: "Celebrate the end of winter season with our famous Spring Jam! Competitions, music, BBQ, and lots of fun in the spring snow.",
      imageUrl: "/Mythenpark-Logo.jpg",
      category: "competition",
      featured: true
    },
    {
      id: 6,
      title: "Advanced Rail Techniques Workshop",
      date: "January 10, 2026",
      description: "Focus on perfecting your rail skills with this specialized workshop. Learn proper approach, balance, and exit techniques for various rail obstacles.",
      imageUrl: "/Mythenpark-Logo.jpg",
      category: "workshop",
      featured: false
    },
    {
      id: 7,
      title: "Photography Day",
      date: "February 25, 2026",
      description: "Professional photographers will be on site to capture your best moments on the snow. Book a session and get amazing action shots of your skills!",
      imageUrl: "/Mythenpark-Logo.jpg",
      category: "special",
      featured: false
    }
  ];

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filteredEvents, setFilteredEvents] = useState<Event[]>(events);
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);


  // Filter events based on selected category
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(events.filter(event => event.category === selectedCategory));
    }
  }, [selectedCategory]);

  // Rotate featured events
  useEffect(() => {
    const featuredEvents = events.filter(event => event.featured);
    
    const interval = setInterval(() => {
      setCurrentFeaturedIndex(prevIndex => 
        prevIndex === featuredEvents.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);
    
    return () => clearInterval(interval);
  }, [events]);



  const featuredEvents = events.filter(event => event.featured);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-5xl font-bold mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          Upcoming Events
        </h1>
        
        <p className="text-xl text-center mb-12 text-gray-600 dark:text-gray-300">
          Join us for exciting snow adventures and competitions
        </p>

        {/* Featured Event Carousel */}
        <div className="relative h-96 mb-16 overflow-hidden rounded-2xl shadow-2xl">
          <div key={featuredEvents[currentFeaturedIndex]?.id} className="absolute inset-0 bg-black">
              <div className="relative h-full w-full">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent opacity-80 z-10" />
                <div 
                  className="absolute inset-0 z-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${featuredEvents[currentFeaturedIndex]?.imageUrl})` }}
                />
                <div className="absolute bottom-0 left-0 right-0 p-8 z-20 text-white">
                  <div>
                    <span className="inline-block px-3 py-1 mb-4 bg-blue-600 rounded-full text-sm font-semibold text-white">
                      Featured Event
                    </span>
                    <h2 className="text-4xl font-bold mb-2 text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">{featuredEvents[currentFeaturedIndex]?.title}</h2>
                    <p className="text-xl mb-3 text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">{featuredEvents[currentFeaturedIndex]?.date}</p>
                    <p className="text-white max-w-2xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">{featuredEvents[currentFeaturedIndex]?.description}</p>
                  </div>
                </div>
              </div>
            </div>
          
          {/* Carousel indicators */}
          <div className="absolute bottom-4 right-4 z-30 flex space-x-2">
            {featuredEvents.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentFeaturedIndex(index)}
                className={`w-3 h-3 rounded-full ${
                  index === currentFeaturedIndex ? 'bg-white' : 'bg-gray-400 bg-opacity-50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <FilterButton 
            label="All Events" 
            isActive={selectedCategory === 'all'} 
            onClick={() => setSelectedCategory('all')} 
          />
          <FilterButton 
            label="Competitions" 
            isActive={selectedCategory === 'competition'} 
            onClick={() => setSelectedCategory('competition')} 
          />
          <FilterButton 
            label="Workshops" 
            isActive={selectedCategory === 'workshop'} 
            onClick={() => setSelectedCategory('workshop')} 
          />
          <FilterButton 
            label="Special Events" 
            isActive={selectedCategory === 'special'} 
            onClick={() => setSelectedCategory('special')} 
          />
        </div>

        {/* Events grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="h-48 relative overflow-hidden">
                  <div 
                    className="absolute inset-0 bg-cover bg-center transform transition-transform duration-700 hover:scale-110"
                    style={{ backgroundImage: `url(${event.imageUrl})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent opacity-60" />
                  <div className="absolute bottom-0 left-0 p-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white ${
                      event.category === 'competition' ? 'bg-red-500' : 
                      event.category === 'workshop' ? 'bg-green-500' : 'bg-purple-500'
                    }`}>
                      {event.category === 'competition' ? 'Competition' : 
                       event.category === 'workshop' ? 'Workshop' : 'Special Event'}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{event.title}</h3>
                  <p className="text-blue-600 dark:text-blue-400 mb-4">{event.date}</p>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{event.description}</p>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-300 transform hover:scale-105">
                    Learn More
                  </button>
                </div>
              </div>
            ))}
        </div>
        
        {/* Empty state */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-16">
            <p className="text-2xl text-gray-500 dark:text-gray-400">No events found in this category</p>
            <button 
              onClick={() => setSelectedCategory('all')}
              className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View all events
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Filter button component
function FilterButton({ label, isActive, onClick }: { label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
        isActive 
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
      }`}
    >
      {label}
    </button>
  );
}

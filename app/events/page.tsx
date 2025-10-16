"use client"

import { useState, useEffect } from 'react';
import { ThumbsUp, Calendar, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

// Define event type
type Event = {
  id: number;
  title: string;
  date: string;
  description: string;
  imageUrl: string;
  category: 'competition' | 'workshop' | 'special';
  featured: boolean;
  votes?: number;
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

  const [voteCounts, setVoteCounts] = useState<Record<number, number>>({});
  const [userVotes, setUserVotes] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);


  // Load votes from API and localStorage on mount
  useEffect(() => {
    async function loadVoteData() {
      try {
        // Fetch vote counts from API
        const res = await fetch('/api/votes');
        const data = await res.json();
        setVoteCounts(data);
        
        // Load user's votes from localStorage
        const savedVotes = localStorage.getItem('mythenpark-votes');
        if (savedVotes) {
          setUserVotes(new Set(JSON.parse(savedVotes)));
        }
      } catch (err) {
        console.error('Error fetching votes:', err);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadVoteData();
  }, []);


  // Handle vote/unvote
  const handleVote = async (eventId: number) => {
    const hasVoted = userVotes.has(eventId);
    const action = hasVoted ? 'downvote' : 'upvote';
    
    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, action })
      });
      
      const data = await response.json();
      
      // Update vote counts
      setVoteCounts(prev => ({ ...prev, [eventId]: data.votes }));
      
      // Update user votes
      const newUserVotes = new Set(userVotes);
      if (hasVoted) {
        newUserVotes.delete(eventId);
      } else {
        newUserVotes.add(eventId);
      }
      setUserVotes(newUserVotes);
      
      // Save to localStorage
      localStorage.setItem('mythenpark-votes', JSON.stringify(Array.from(newUserVotes)));
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  // Show loading state while fetching vote data
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="inline-block rounded-full h-20 w-20 border-4 border-blue-500 border-t-transparent mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.p 
            className="text-xl text-gray-600"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Loading events...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Events Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              variants={cardVariants}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
            >
              {/* Featured Badge */}
              {event.featured && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                  className="absolute top-4 left-4 z-20 flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg"
                >
                  <Sparkles className="w-3 h-3" />
                  Featured
                </motion.div>
              )}

              {/* Image Section */}
              <div className="h-56 relative overflow-hidden">
                <motion.div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${event.imageUrl})` }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Category Badge */}
                <motion.div 
                  className="absolute bottom-4 left-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white backdrop-blur-sm ${
                    event.category === 'competition' ? 'bg-red-500/90' : 
                    event.category === 'workshop' ? 'bg-green-500/90' : 'bg-purple-500/90'
                  }`}>
                    {event.category === 'competition' ? '🏆 Competition' : 
                     event.category === 'workshop' ? '🎓 Workshop' : '✨ Special'}
                  </span>
                </motion.div>
              </div>

              {/* Content Section */}
              <div className="p-6 space-y-4">
                {/* Title */}
                <motion.h3 
                  className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                >
                  {event.title}
                </motion.h3>
                
                {/* Date */}
                <motion.div 
                  className="flex items-center gap-2 text-blue-600"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                >
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">{event.date}</span>
                </motion.div>
                
                {/* Description */}
                <motion.p 
                  className="text-gray-600 text-sm line-clamp-3 leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.6 }}
                >
                  {event.description}
                </motion.p>
                
                {/* Vote Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.7 }}
                >
                  <motion.button 
                    onClick={() => handleVote(event.id)}
                    className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      userVotes.has(event.id)
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ThumbsUp className={`w-5 h-5 ${
                      userVotes.has(event.id) ? 'fill-current' : ''
                    }`} />
                    <span className="text-lg font-bold">{voteCounts[event.id] || 0}</span>
                    <span className="text-sm">
                      {userVotes.has(event.id) ? 'Participating!' : 'Join Event'}
                    </span>
                  </motion.button>
                </motion.div>
              </div>

              {/* Animated Border Effect */}
              <motion.div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                initial={{ opacity: 0 }}
                whileHover={{ 
                  opacity: 1,
                  boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)"
                }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

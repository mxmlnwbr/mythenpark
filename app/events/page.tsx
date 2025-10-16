"use client"

import { useState, useEffect } from 'react';
import { ThumbsUp, Calendar, Sparkles, X, MapPin, Clock, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    }
  ];

  const [voteCounts, setVoteCounts] = useState<Record<number, number>>({});
  const [userVotes, setUserVotes] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


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


  // Open modal with event details
  const openModal = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedEvent(null), 300);
  };

  // Handle vote/unvote
  const handleVote = async (eventId: number, e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent modal from opening when voting
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
              onClick={() => openModal(event)}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
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
                    onClick={(e) => handleVote(event.id, e)}
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

      {/* Event Details Modal */}
      <AnimatePresence>
        {isModalOpen && selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              {/* Modal Header Image */}
              <div className="relative h-64 overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${selectedEvent.imageUrl})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                
                {/* Close Button */}
                <motion.button
                  onClick={closeModal}
                  className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-full transition-colors shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-6 h-6 text-gray-800" />
                </motion.button>

                {/* Featured Badge */}
                {selectedEvent.featured && (
                  <div className="absolute top-4 left-4 flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-2 rounded-full text-sm font-bold shadow-lg">
                    <Sparkles className="w-4 h-4" />
                    Featured Event
                  </div>
                )}

                {/* Category Badge */}
                <div className="absolute bottom-4 left-4">
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold text-white backdrop-blur-md shadow-lg ${
                    selectedEvent.category === 'competition' ? 'bg-red-500/95' : 
                    selectedEvent.category === 'workshop' ? 'bg-green-500/95' : 'bg-purple-500/95'
                  }`}>
                    {selectedEvent.category === 'competition' ? '🏆 Competition' : 
                     selectedEvent.category === 'workshop' ? '🎓 Workshop' : '✨ Special Event'}
                  </span>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-8 space-y-6">
                {/* Title */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {selectedEvent.title}
                  </h2>
                  <div className="flex items-center gap-2 text-blue-600">
                    <Calendar className="w-5 h-5" />
                    <span className="text-lg font-semibold">{selectedEvent.date}</span>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-gray-900">About this Event</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedEvent.description}
                  </p>
                </div>

                {/* Event Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                    <Clock className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Duration</p>
                      <p className="text-sm font-bold text-gray-900">Full Day</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                    <MapPin className="w-6 h-6 text-purple-600" />
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Location</p>
                      <p className="text-sm font-bold text-gray-900">Mythenpark</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                    <Users className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Participants</p>
                      <p className="text-sm font-bold text-gray-900">{voteCounts[selectedEvent.id] || 0} joined</p>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-gray-900">What to Expect</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">✓</span>
                      <span>Professional instructors and guides</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">✓</span>
                      <span>All skill levels welcome</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">✓</span>
                      <span>Equipment rental available on-site</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">✓</span>
                      <span>Refreshments and breaks included</span>
                    </li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVote(selectedEvent.id);
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                      userVotes.has(selectedEvent.id)
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ThumbsUp className={`w-5 h-5 ${
                      userVotes.has(selectedEvent.id) ? 'fill-current' : ''
                    }`} />
                    <span>{voteCounts[selectedEvent.id] || 0}</span>
                    <span className="text-sm">
                      {userVotes.has(selectedEvent.id) ? 'Participating!' : 'Join Event'}
                    </span>
                  </motion.button>
                  <motion.button
                    onClick={closeModal}
                    className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Close
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

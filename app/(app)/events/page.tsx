"use client"

import { useState, useEffect } from 'react';
import { ThumbsUp, Calendar, Sparkles, X, MapPin, Clock, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDeviceId } from '@/lib/fingerprint';

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

// Format ISO date to readable format
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString + 'T00:00:00Z');
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [voteCounts, setVoteCounts] = useState<Record<number, number>>({});
  const [userVotes, setUserVotes] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [syncingVotes, setSyncingVotes] = useState<Set<number>>(new Set()); // Track which events are syncing
  
  // Registration form state
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Load events and votes from API on mount
  useEffect(() => {
    async function loadData() {
      try {
        // Fetch events from API
        const eventsRes = await fetch('/api/events');
        const eventsData = await eventsRes.json();
        // Payload returns data in { docs: [...] } format
        const events = eventsData.docs || eventsData;
        setEvents(events);
        
        // Get device ID for this browser/device
        const deviceId = getDeviceId();
        
        // Fetch vote counts and user's voting status (device-based)
        const votesRes = await fetch(`/api/votes?deviceId=${encodeURIComponent(deviceId)}`);
        const votesData = await votesRes.json();
        setVoteCounts(votesData.votes || votesData); // Support both old and new format
        
        // Set user's votes from device-based tracking
        if (votesData.userVotes) {
          setUserVotes(new Set(votesData.userVotes));
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, []);


  // Open modal with event details
  const openModal = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setShowRegistrationForm(false);
    setRegistrationSuccess(false);
    setFormData({ firstName: '', lastName: '', email: '' });
    setFormErrors({});
    setTimeout(() => setSelectedEvent(null), 300);
  };

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    } else if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(formData.firstName)) {
      errors.firstName = 'First name can only contain letters';
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    } else if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(formData.lastName)) {
      errors.lastName = 'Last name can only contain letters';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !selectedEvent) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          ...formData,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to register');
      }
      
      // Success!
      setRegistrationSuccess(true);
      setFormData({ firstName: '', lastName: '', email: '' });
      setFormErrors({});
      
      // Also mark as participating
      if (!userVotes.has(selectedEvent.id)) {
        handleVote(selectedEvent.id);
      }
    } catch (error: any) {
      setFormErrors({ submit: error.message || 'Failed to register. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle vote/unvote with optimistic UI updates
  const handleVote = async (eventId: number, e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent modal from opening when voting
    const hasVoted = userVotes.has(eventId);
    const action = hasVoted ? 'downvote' : 'upvote';
    
    // Store previous state for rollback if API fails
    const previousVoteCount = voteCounts[eventId] || 0;
    const previousUserVotes = new Set(userVotes);
    
    // OPTIMISTIC UPDATE: Update UI immediately for instant feedback
    const newUserVotes = new Set(userVotes);
    const optimisticVoteCount = hasVoted 
      ? Math.max(0, previousVoteCount - 1)
      : previousVoteCount + 1;
    
    if (hasVoted) {
      newUserVotes.delete(eventId);
    } else {
      newUserVotes.add(eventId);
    }
    
    // Update UI instantly (before API call)
    setVoteCounts(prev => ({ ...prev, [eventId]: optimisticVoteCount }));
    setUserVotes(newUserVotes);
    
    // Mark as syncing
    setSyncingVotes(prev => new Set([...prev, eventId]));
    
    // Update database in background
    try {
      // Get device ID for this browser/device
      const deviceId = getDeviceId();
      
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, action, deviceId })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Handle "already voted" error specifically
        if (data.alreadyVoted) {
          // User already voted, sync UI with server state
          setUserVotes(prev => {
            const next = new Set(prev);
            next.add(eventId);
            return next;
          });
          alert(data.message || "You're already participating in this event!");
        } else {
          throw new Error(data.message || 'Failed to update vote');
        }
        
        // Rollback optimistic update
        setVoteCounts(prev => ({ ...prev, [eventId]: previousVoteCount }));
      } else {
        // Success: Sync with actual server response
        setVoteCounts(prev => ({ ...prev, [eventId]: data.votes }));
      }
      
      // Remove from syncing state
      setSyncingVotes(prev => {
        const next = new Set(prev);
        next.delete(eventId);
        return next;
      });
    } catch (error) {
      console.error('Error voting:', error);
      
      // ROLLBACK: Revert to previous state on error
      setVoteCounts(prev => ({ ...prev, [eventId]: previousVoteCount }));
      setUserVotes(previousUserVotes);
      
      // Remove from syncing state
      setSyncingVotes(prev => {
        const next = new Set(prev);
        next.delete(eventId);
        return next;
      });
      
      // Show error message to user
      alert('Failed to update vote. Please try again.');
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
              className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col h-full"
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
              <div className="p-6 flex flex-col flex-1">
                {/* Title */}
                <motion.h3 
                  className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 min-h-[3.5rem] line-clamp-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                >
                  {event.title}
                </motion.h3>
                
                {/* Date */}
                <motion.div 
                  className="flex items-center gap-2 text-blue-600 mt-2 mb-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                >
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">{formatDate(event.date)}</span>
                </motion.div>
                
                {/* Description */}
                <motion.p 
                  className="text-gray-600 text-sm line-clamp-3 leading-relaxed flex-1 mb-4 h-[4.5rem] overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.6 }}
                >
                  {event.description}
                </motion.p>
                
                {/* Vote Button */}
                <motion.div
                  className="mt-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.7 }}
                >
                  <motion.button 
                    onClick={(e) => handleVote(event.id, e)}
                    disabled={syncingVotes.has(event.id)}
                    className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 relative ${
                      userVotes.has(event.id)
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } ${syncingVotes.has(event.id) ? 'opacity-70 cursor-wait' : ''}`}
                    whileHover={syncingVotes.has(event.id) ? {} : { scale: 1.05 }}
                    whileTap={syncingVotes.has(event.id) ? {} : { scale: 0.95 }}
                  >
                    <ThumbsUp className={`w-5 h-5 ${
                      userVotes.has(event.id) ? 'fill-current' : ''
                    }`} />
                    <span className="text-lg font-bold">{voteCounts[event.id] || 0}</span>
                    <span className="text-sm">
                      {userVotes.has(event.id) ? 'Participating!' : 'Join Event'}
                    </span>
                    {syncingVotes.has(event.id) && (
                      <motion.span
                        className="absolute right-3"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        ⟳
                      </motion.span>
                    )}
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
                    <span className="text-lg font-semibold">{formatDate(selectedEvent.date)}</span>
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

                {/* Registration Form */}
                {!showRegistrationForm && !registrationSuccess && (
                  <div className="pt-4">
                    <button
                      onClick={() => setShowRegistrationForm(true)}
                      className="w-full px-6 py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-xl transition-colors"
                    >
                      📝 Sign Up for this Event
                    </button>
                  </div>
                )}

                {showRegistrationForm && !registrationSuccess && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 pt-4 border-t border-gray-200"
                  >
                    <h3 className="text-xl font-bold text-gray-900">Event Registration</h3>
                    <form onSubmit={handleRegistrationSubmit} className="space-y-4">
                      {/* First Name */}
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                          First Name *
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            formErrors.firstName ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter your first name"
                        />
                        {formErrors.firstName && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>
                        )}
                      </div>

                      {/* Last Name */}
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            formErrors.lastName ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter your last name"
                        />
                        {formErrors.lastName && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          id="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            formErrors.email ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="your.email@example.com"
                        />
                        {formErrors.email && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                        )}
                      </div>

                      {/* Submit Error */}
                      {formErrors.submit && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-600">{formErrors.submit}</p>
                        </div>
                      )}

                      {/* Form Actions */}
                      <div className="flex gap-3 pt-2">
                        <motion.button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                          whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                        >
                          {isSubmitting ? 'Submitting...' : 'Complete Registration'}
                        </motion.button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowRegistrationForm(false);
                            setFormErrors({});
                          }}
                          className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {registrationSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 bg-green-50 border-2 border-green-200 rounded-xl text-center space-y-3"
                  >
                    <div className="text-5xl">✓</div>
                    <h3 className="text-xl font-bold text-green-800">Registration Successful!</h3>
                    <p className="text-green-700">
                      You're all set for {selectedEvent.title}. We look forward to seeing you there!
                    </p>
                    <button
                      onClick={() => {
                        setRegistrationSuccess(false);
                        setShowRegistrationForm(false);
                      }}
                      className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      Done
                    </button>
                  </motion.div>
                )}

                {/* Action Buttons */}
                {!showRegistrationForm && !registrationSuccess && (
                  <div className="flex gap-4 pt-4">
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVote(selectedEvent.id);
                    }}
                    disabled={syncingVotes.has(selectedEvent.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 relative ${
                      userVotes.has(selectedEvent.id)
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } ${syncingVotes.has(selectedEvent.id) ? 'opacity-70 cursor-wait' : ''}`}
                    whileHover={syncingVotes.has(selectedEvent.id) ? {} : { scale: 1.02 }}
                    whileTap={syncingVotes.has(selectedEvent.id) ? {} : { scale: 0.98 }}
                  >
                    <ThumbsUp className={`w-5 h-5 ${
                      userVotes.has(selectedEvent.id) ? 'fill-current' : ''
                    }`} />
                    <span>{voteCounts[selectedEvent.id] || 0}</span>
                    <span className="text-sm">
                      {userVotes.has(selectedEvent.id) ? 'Participating!' : 'Join Event'}
                    </span>
                    {syncingVotes.has(selectedEvent.id) && (
                      <motion.span
                        className="absolute right-4 text-xl"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        ⟳
                      </motion.span>
                    )}
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
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

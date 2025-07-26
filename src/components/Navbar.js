import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-scroll';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMusic, setCurrentMusic] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef(null);

  const navigation = [
    { name: 'Home', href: 'home' },
    { name: 'About', href: 'about' },
    { name: 'Research', href: 'research' },
    { name: 'Publications', href: 'publications' },
    { name: 'Teaching', href: 'teaching' },
    { name: 'Contact', href: 'contact' },
  ];

  const fetchRandomMusic = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URI}/api/music/random`);
      console.log('Navbar Music API response:', response.data);
      
      // Handle the nested response structure
      const musicData = response.data.data || response.data;
      console.log('Music data:', musicData);
      console.log('File URL:', musicData.fileUrl);
      console.log('File path:', musicData.filePath);
      console.log('MIME type:', musicData.mimeType);
      
      setCurrentMusic(musicData);
      
      if (audioRef.current) {
        audioRef.current.src = musicData.fileUrl;
        
        // Set muted for auto-play workaround
        audioRef.current.muted = true;
        
        // Wait for audio to load before attempting to play
        audioRef.current.addEventListener('canplaythrough', () => {
          console.log('Audio loaded successfully in Navbar');
          // Auto-play after user interaction
          if (hasUserInteracted) {
            triggerAutoPlay();
          }
        }, { once: true });

        audioRef.current.addEventListener('error', (e) => {
          console.error('Audio loading error in Navbar:', e);
          console.error('Audio error details:', audioRef.current.error);
          setError('Unable to load audio file');
        });

        audioRef.current.load();
      }
    } catch (err) {
      console.error('Error fetching music in Navbar:', err);
      setError('Unable to load music');
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger auto-play on user interaction
  const triggerAutoPlay = () => {
    if (!audioRef.current || isPlaying) return;
    
    console.log('User interaction detected - triggering auto-play in Navbar');
    
    try {
      // Try unmuted play first
      audioRef.current.muted = false;
      audioRef.current.play().then(() => {
        console.log('Auto-play successful after user interaction in Navbar');
        setIsPlaying(true);
        setIsMuted(false);
        setError(null);
      }).catch((err) => {
        console.log('Unmuted auto-play failed, trying muted:', err);
        
        // Fallback to muted play
        audioRef.current.muted = true;
        audioRef.current.play().then(() => {
          console.log('Muted auto-play successful in Navbar');
          setIsPlaying(true);
          
          // Unmute after a short delay
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.muted = false;
              setIsMuted(false);
              console.log('Audio unmuted after user interaction in Navbar');
            }
          }, 500);
        }).catch((err2) => {
          console.error('All auto-play attempts failed in Navbar:', err2);
          setError('Auto-play blocked - click play button');
        });
      });
    } catch (err) {
      console.error('Auto-play error in Navbar:', err);
      setError('Unable to play music');
    }
  };

  // Handle user interaction to enable auto-play
  const handleUserInteraction = () => {
    if (!hasUserInteracted) {
      console.log('User interaction detected in Navbar, enabling auto-play');
      setHasUserInteracted(true);
      triggerAutoPlay();
    }
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0; // Reset to beginning when stopping
        setIsPlaying(false);
      } else {
        audioRef.current.muted = false;
        audioRef.current.play().then(() => {
          setIsPlaying(true);
          setIsMuted(false);
          setError(null); // Clear any previous errors
        }).catch((err) => {
          console.error('Play failed in Navbar:', err);
          setError('Unable to play music');
        });
      }
    }
  };

  const handleNext = () => {
    setIsPlaying(false);
    setIsMuted(true);
    fetchRandomMusic();
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    // Auto-play next song after a short delay
    setTimeout(() => {
      handleNext();
    }, 2000);
  };

  const handleAudioError = () => {
    setError('Error playing music');
    setIsPlaying(false);
  };

  useEffect(() => {
    fetchRandomMusic();
    
    // Add comprehensive event listeners for user interaction
    const interactionEvents = [
      'click', 
      'touchstart', 
      'touchend',
      'keydown', 
      'mousedown', 
      'mouseenter', 
      'focus',
      'pointerdown',
      'pointerenter',
      'wheel',
      'dragstart',
      'selectstart'
    ];
    
    const handleInteraction = () => {
      console.log('General interaction detected in Navbar');
      handleUserInteraction();
    };
    
    // Add listeners to document and window for maximum coverage
    interactionEvents.forEach(event => {
      document.addEventListener(event, handleInteraction, { once: true, passive: true });
      window.addEventListener(event, handleInteraction, { once: true, passive: true });
    });

    // Enhanced scroll detection with multiple approaches
    let scrollTimeout;
    let lastScrollY = window.scrollY;
    let lastScrollTime = Date.now();
    
    const handleScroll = (event) => {
      const currentTime = Date.now();
      console.log('Scroll event fired in Navbar:', event.type, 'from:', event.target);
      console.log('Current scrollY:', window.scrollY, 'Last scrollY:', lastScrollY);
      console.log('Time since last scroll:', currentTime - lastScrollTime, 'ms');
      
      if (!hasUserInteracted) {
        console.log('Scroll detected in Navbar - triggering auto-play');
        setHasUserInteracted(true);
        triggerAutoPlay();
      }
      
      lastScrollY = window.scrollY;
      lastScrollTime = currentTime;
      
      // Clear existing timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      // Set new timeout to prevent multiple triggers
      scrollTimeout = setTimeout(() => {
        // Additional scroll trigger after a short delay
        if (!isPlaying && hasUserInteracted) {
          console.log('Scroll timeout in Navbar - triggering auto-play again');
          triggerAutoPlay();
        }
      }, 100);
    };

    // Wheel event for mouse wheel scrolling
    const handleWheel = (event) => {
      console.log('Wheel event fired in Navbar:', event.deltaY, 'deltaMode:', event.deltaMode);
      if (!hasUserInteracted) {
        console.log('Wheel scroll detected in Navbar - triggering auto-play');
        setHasUserInteracted(true);
        triggerAutoPlay();
      }
    };

    // Touch scroll events for mobile and touchpad
    const handleTouchScroll = (event) => {
      console.log('Touch scroll event fired in Navbar');
      if (!hasUserInteracted) {
        console.log('Touch scroll detected in Navbar - triggering auto-play');
        setHasUserInteracted(true);
        triggerAutoPlay();
      }
    };

    // Touchpad specific events
    const handleTouchpadScroll = (event) => {
      console.log('Touchpad scroll event fired in Navbar:', event.type);
      if (!hasUserInteracted) {
        console.log('Touchpad scroll detected in Navbar - triggering auto-play');
        setHasUserInteracted(true);
        triggerAutoPlay();
      }
    };

    // Add scroll listeners to multiple elements with different options
    const scrollOptions = { passive: true, capture: true };
    
    // Multiple scroll event targets
    document.addEventListener('scroll', handleScroll, scrollOptions);
    window.addEventListener('scroll', handleScroll, scrollOptions);
    document.documentElement.addEventListener('scroll', handleScroll, scrollOptions);
    document.body.addEventListener('scroll', handleScroll, scrollOptions);

    // Add wheel listeners for mouse wheel scrolling
    document.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: true });

    // Add touch scroll listeners
    document.addEventListener('touchmove', handleTouchScroll, { passive: true });
    window.addEventListener('touchmove', handleTouchScroll, { passive: true });

    // Add touchpad specific listeners
    document.addEventListener('gesturestart', handleTouchpadScroll, { passive: true });
    document.addEventListener('gesturechange', handleTouchpadScroll, { passive: true });
    document.addEventListener('gestureend', handleTouchpadScroll, { passive: true });
    
    // Additional touchpad events
    document.addEventListener('pointerdown', handleTouchpadScroll, { passive: true });
    document.addEventListener('pointermove', handleTouchpadScroll, { passive: true });
    document.addEventListener('pointerup', handleTouchpadScroll, { passive: true });

    // More aggressive touchpad detection
    document.addEventListener('touchstart', handleTouchpadScroll, { passive: true });
    document.addEventListener('touchend', handleTouchpadScroll, { passive: true });
    document.addEventListener('touchcancel', handleTouchpadScroll, { passive: true });

    // Alternative approach: Monitor scroll position changes more aggressively
    let scrollCheckInterval;
    let lastCheckScrollY = window.scrollY;
    let consecutiveScrollChanges = 0;
    
    const checkScrollPosition = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY !== lastCheckScrollY) {
        consecutiveScrollChanges++;
        console.log('Scroll position changed in Navbar - triggering auto-play');
        console.log('From:', lastCheckScrollY, 'To:', currentScrollY);
        console.log('Consecutive changes:', consecutiveScrollChanges);
        
        if (!hasUserInteracted) {
          setHasUserInteracted(true);
          triggerAutoPlay();
        }
        lastCheckScrollY = currentScrollY;
      } else {
        consecutiveScrollChanges = 0;
      }
    };

    // Start monitoring scroll position more frequently
    scrollCheckInterval = setInterval(checkScrollPosition, 50); // Check every 50ms

    // Also listen for any mouse movement as a fallback
    const handleMouseMove = () => {
      if (!hasUserInteracted) {
        console.log('Mouse movement detected in Navbar');
        setHasUserInteracted(true);
        triggerAutoPlay();
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove, { once: true, passive: true });

    // Strategy: Try to detect if user has already interacted with the page
    const checkForExistingInteraction = () => {
      if (window.scrollY > 0 || document.activeElement || window.innerHeight !== window.outerHeight) {
        console.log('Existing interaction detected in Navbar');
        setHasUserInteracted(true);
        triggerAutoPlay();
      }
    };

    // Check after a short delay
    setTimeout(checkForExistingInteraction, 1000);

    // Cleanup on unmount
    return () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      if (scrollCheckInterval) {
        clearInterval(scrollCheckInterval);
      }
      interactionEvents.forEach(event => {
        document.removeEventListener(event, handleInteraction);
        window.removeEventListener(event, handleInteraction);
      });
      document.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleScroll);
      document.documentElement.removeEventListener('scroll', handleScroll);
      document.body.removeEventListener('scroll', handleScroll);
      document.removeEventListener('wheel', handleWheel);
      window.removeEventListener('wheel', handleWheel);
      document.removeEventListener('touchmove', handleTouchScroll);
      window.removeEventListener('touchmove', handleTouchScroll);
      document.removeEventListener('gesturestart', handleTouchpadScroll);
      document.removeEventListener('gesturechange', handleTouchpadScroll);
      document.removeEventListener('gestureend', handleTouchpadScroll);
      document.removeEventListener('pointerdown', handleTouchpadScroll);
      document.removeEventListener('pointermove', handleTouchpadScroll);
      document.removeEventListener('pointerup', handleTouchpadScroll);
      document.removeEventListener('touchstart', handleTouchpadScroll);
      document.removeEventListener('touchend', handleTouchpadScroll);
      document.removeEventListener('touchcancel', handleTouchpadScroll);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <nav className="fixed w-full bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Desktop menu */}
          <div className="hidden md:block w-full">
            <div className="flex items-baseline justify-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  smooth={true}
                  duration={500}
                  className="text-gray-600 hover:text-crimson-600 px-3 py-2 rounded-md text-sm font-medium cursor-pointer"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Music Player - Desktop */}
          <div className="hidden md:flex items-center space-x-2">
            <div className="bg-black/80 backdrop-blur-sm rounded-lg p-2 text-white max-w-48">
              <div className="flex items-center space-x-2">
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 bg-crimson-500 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.369 4.369 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"/>
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-300 font-medium">
                    {isLoading ? 'Loading...' : error ? 'Error' : isMuted ? 'Muted' : 'Now Playing'}
                  </div>
                  <div className="text-xs font-semibold text-white truncate">
                    {currentMusic ? currentMusic.name : error || 'No music available'}
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={handlePlayPause}
                    disabled={isLoading || !currentMusic}
                    className="w-5 h-5 bg-crimson-500 hover:bg-crimson-600 disabled:bg-gray-600 rounded-full flex items-center justify-center transition-colors"
                  >
                    {isLoading ? (
                      <div className="w-2.5 h-2.5 border border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : isPlaying ? (
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-2.5 h-2.5 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={isLoading}
                    className="w-5 h-5 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 rounded-full flex items-center justify-center transition-colors"
                  >
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex w-full justify-end">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-crimson-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-crimson-500"
            >
              {isOpen ? (
                <XMarkIcon className="block h-6 w-6" />
              ) : (
                <Bars3Icon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                smooth={true}
                duration={500}
                className="text-gray-600 hover:text-crimson-600 block px-3 py-2 rounded-md text-base font-medium cursor-pointer"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Music Player - Mobile */}
            <div className="mt-4 px-3 py-2 bg-black/80 backdrop-blur-sm rounded-lg text-white">
              <div className="flex items-center space-x-2">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-crimson-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.369 4.369 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"/>
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-300 font-medium">
                    {isLoading ? 'Loading...' : error ? 'Error' : isMuted ? 'Muted' : 'Now Playing'}
                  </div>
                  <div className="text-xs font-semibold text-white truncate">
                    {currentMusic ? currentMusic.name : error || 'No music available'}
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={handlePlayPause}
                    disabled={isLoading || !currentMusic}
                    className="w-6 h-6 bg-crimson-500 hover:bg-crimson-600 disabled:bg-gray-600 rounded-full flex items-center justify-center transition-colors"
                  >
                    {isLoading ? (
                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : isPlaying ? (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={isLoading}
                    className="w-6 h-6 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 rounded-full flex items-center justify-center transition-colors"
                  >
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onEnded={handleAudioEnded}
        onError={handleAudioError}
        preload="metadata"
      />
    </nav>
  );
};

export default Navbar; 
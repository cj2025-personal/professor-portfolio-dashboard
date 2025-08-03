import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

const CoursePresentations = () => {
  const { courseId } = useParams();
  const [presentations, setPresentations] = useState([]);
  const [courseInfo, setCourseInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPresentation, setSelectedPresentation] = useState(null);
  const [showPresentation, setShowPresentation] = useState(false);

  useEffect(() => {
    const fetchPresentations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch course presentations using courseId
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URI}/api/courses/${courseId}/presentations`);
        
        console.log('Presentations response:', response);
        console.log('Response data:', response.data);
        
        // Handle the specific API response format
        if (response.data && response.data.success) {
          const presentationsData = response.data.data || [];
          const courseInfoData = {
            courseId: response.data.courseId,
            count: response.data.count
          };
          
          console.log('Processed presentations data:', presentationsData);
          console.log('Course info data:', courseInfoData);
          
          setPresentations(presentationsData);
          setCourseInfo(courseInfoData);
        } else {
          // Handle other response formats
          let presentationsData = response.data;
          let courseInfoData = {};
          
          if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
            if (Array.isArray(response.data.presentations)) {
              presentationsData = response.data.presentations;
            } else if (Array.isArray(response.data.data)) {
              presentationsData = response.data.data;
            } else if (Array.isArray(response.data.items)) {
              presentationsData = response.data.items;
            } else {
              presentationsData = [response.data];
            }
            courseInfoData = response.data.courseInfo || response.data.course || {};
          } else if (Array.isArray(response.data)) {
            presentationsData = response.data;
          } else {
            presentationsData = [];
          }
          
          if (!Array.isArray(presentationsData)) {
            presentationsData = [];
          }
          
          setPresentations(presentationsData);
          setCourseInfo(courseInfoData);
        }
        
      } catch (err) {
        console.error('Error fetching presentations:', err);
        console.error('Error details:', err.response?.data || err.message);
        setError('Failed to load presentations. Please try again later.');
        
        // Fallback data for development
        setPresentations([
          {
            _id: "sample1",
            courseId: "CS101",
            lectureName: "Introduction to Course",
            pptId: "sample1",
            pptPath: "https://example.com/presentations/intro.pptx",
            description: "Overview of the course content and objectives",
            createdAt: "2024-01-15T00:00:00.000Z"
          },
          {
            _id: "sample2",
            courseId: "CS101",
            lectureName: "Week 1: Fundamentals",
            pptId: "sample2",
            pptPath: "https://example.com/presentations/week1.pptx",
            description: "Basic concepts and foundational knowledge",
            createdAt: "2024-01-22T00:00:00.000Z"
          }
        ]);
        setCourseInfo({
          courseId: "CS101",
          count: 2
        });
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchPresentations();
    }
  }, [courseId]);

  // Additional security measures when presentation modal is open
  useEffect(() => {
    if (showPresentation) {
      // Disable text selection globally
      document.body.style.userSelect = 'none';
      document.body.style.WebkitUserSelect = 'none';
      document.body.style.MozUserSelect = 'none';
      document.body.style.msUserSelect = 'none';
      
      // Prevent drag and drop
      const preventDrag = (e) => {
        e.preventDefault();
        return false;
      };
      
      document.addEventListener('dragstart', preventDrag);
      document.addEventListener('drop', preventDrag);
      
      // Prevent print screen and full screen
      const preventPrintScreen = (e) => {
        if (e.key === 'PrintScreen' || (e.ctrlKey && e.key === 'p') || e.key === 'F11') {
          e.preventDefault();
          return false;
        }
      };
      
      document.addEventListener('keydown', preventPrintScreen);
      
      // Prevent full screen API
      const preventFullScreen = () => {
        if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement) {
          document.exitFullscreen && document.exitFullscreen();
          document.webkitExitFullscreen && document.webkitExitFullscreen();
          document.mozCancelFullScreen && document.mozCancelFullScreen();
        }
      };
      
      document.addEventListener('fullscreenchange', preventFullScreen);
      document.addEventListener('webkitfullscreenchange', preventFullScreen);
      document.addEventListener('mozfullscreenchange', preventFullScreen);
      
      // Cleanup function
      return () => {
        document.body.style.userSelect = '';
        document.body.style.WebkitUserSelect = '';
        document.body.style.MozUserSelect = '';
        document.body.style.msUserSelect = '';
        document.removeEventListener('dragstart', preventDrag);
        document.removeEventListener('drop', preventDrag);
        document.removeEventListener('keydown', preventPrintScreen);
        document.removeEventListener('fullscreenchange', preventFullScreen);
        document.removeEventListener('webkitfullscreenchange', preventFullScreen);
        document.removeEventListener('mozfullscreenchange', preventFullScreen);
      };
    }
  }, [showPresentation]);

  const handleViewPresentation = (presentation) => {
    setSelectedPresentation(presentation);
    setShowPresentation(true);
    
    // Add event listeners to prevent right-click and keyboard shortcuts
    const preventDownload = (e) => {
      // Prevent right-click context menu
      if (e.type === 'contextmenu') {
        e.preventDefault();
        return false;
      }
      
      // Prevent common keyboard shortcuts for save/download
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        if (['s', 'd', 'p', 'o'].includes(key)) {
          e.preventDefault();
          return false;
        }
      }
      
      // Prevent F12 (developer tools)
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
    };

    // Add event listeners to the document
    document.addEventListener('contextmenu', preventDownload);
    document.addEventListener('keydown', preventDownload);
    
    // Store the event listeners for cleanup
    setSelectedPresentation(prev => ({
      ...prev,
      eventListeners: { preventDownload }
    }));
  };

  const closePresentation = () => {
    // Remove event listeners
    if (selectedPresentation?.eventListeners) {
      document.removeEventListener('contextmenu', selectedPresentation.eventListeners.preventDownload);
      document.removeEventListener('keydown', selectedPresentation.eventListeners.preventDownload);
    }
    
    setShowPresentation(false);
    setSelectedPresentation(null);
  };

  const getEmbedUrl = (pptPath) => {
    // Use Microsoft Office Online Viewer for better read-only control
    if (pptPath.includes('googleapis.com') || pptPath.includes('firebasestorage.app') || pptPath.includes('.pptx') || pptPath.includes('.ppt')) {
      // For PowerPoint files, use Microsoft Office Online Viewer in read-only mode
      // Additional parameters to ensure read-only: wdAr=1 (aspect ratio), wdStartOn=1 (start on first slide)
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(pptPath)}&wdAr=1&wdStartOn=1&wdEmbedCode=0`;
    }
    // Fallback to Google Docs Viewer if not a PowerPoint file
    return `https://docs.google.com/viewer?url=${encodeURIComponent(pptPath)}&embedded=true&rm=minimal`;
  };

  const getSecureEmbedUrl = (pptPath) => {
    // For PowerPoint files, use a more restrictive approach
    if (pptPath.includes('.pptx') || pptPath.includes('.ppt')) {
      // Use Google Slides viewer which is more restrictive for viewing only
      // Convert the URL to a more secure format with maximum restrictions
      const encodedUrl = encodeURIComponent(pptPath);
      return `https://docs.google.com/gview?url=${encodedUrl}&embedded=true&rm=minimal&chrome=false&widget=true&hl=en&mobilebasic=false&a=v&pid=explorer&efh=false&a=v&chrome=false&embedded=true`;
    }
    
    // For other file types, use Google Docs Viewer with minimal interface
    return `https://docs.google.com/viewer?url=${encodeURIComponent(pptPath)}&embedded=true&rm=minimal&chrome=false&widget=true&mobilebasic=false&a=v&pid=explorer&efh=false&a=v&chrome=false&embedded=true`;
  };

  return (
    <section className="py-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8">
              {/* Header */}
              <div className="mb-8">
                <Link
                  to="/#teaching"
                  className="inline-flex items-center text-crimson-600 hover:text-crimson-700 mb-4"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Teaching
                </Link>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      Course {courseInfo?.courseId || courseId} Presentations
                    </h1>
                    {courseInfo?.count && (
                      <p className="text-lg text-gray-600 mt-2">Total Presentations: {courseInfo.count}</p>
                    )}
                  </div>
                  <Link
                    to={`/course/${courseId}/discussions`}
                    className="inline-flex items-center px-4 py-2 border border-crimson-300 text-sm font-medium rounded-md text-crimson-700 bg-white hover:bg-crimson-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-crimson-500"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Discussions
                  </Link>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-crimson-600 hover:bg-crimson-500 transition ease-in-out duration-150 cursor-not-allowed">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading presentations...
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && !loading && (
                <div className="text-center py-8">
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error loading presentations</h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>{error}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Presentations List */}
              {!loading && !error && (
                <div className="space-y-6">
                  {presentations.length === 0 ? (
                    <div className="text-center py-8">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No presentations</h3>
                      <p className="mt-1 text-sm text-gray-500">No presentations have been uploaded for this course yet.</p>
                    </div>
                  ) : (
                    <div className="grid gap-6">
                      {presentations.map((presentation) => (
                        <div
                          key={presentation._id || presentation.id || Math.random()}
                          className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="mb-2">
                                <span className="text-sm font-medium text-crimson-600 bg-crimson-50 px-2 py-1 rounded">
                                  {presentation.courseId || courseId}
                                </span>
                              </div>
                              <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {presentation.lectureName || presentation.title || 'Untitled Presentation'}
                              </h3>
                              <p className="text-gray-600 mb-3">
                                {presentation.description || 'No description available'}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>Created: {new Date(presentation.createdAt || presentation.uploadDate || new Date()).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <button
                                onClick={() => handleViewPresentation(presentation)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-crimson-600 hover:bg-crimson-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-crimson-500"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                View Presentation
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Presentation Modal */}
      {showPresentation && selectedPresentation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedPresentation.lectureName || selectedPresentation.title}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-sm text-gray-500">
                    {selectedPresentation.courseId || courseId}
                  </p>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    View Only
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    Modal View
                  </span>
                </div>
              </div>
              <button
                onClick={closePresentation}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Presentation Content */}
            <div className="flex-1 p-4 relative">
              {/* Security overlay to prevent interactions */}
              <div 
                className="absolute inset-0 z-10 pointer-events-none"
                style={{ 
                  background: 'transparent',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none'
                }}
              />
              
              {/* Warning message */}
              <div className="absolute top-2 left-2 z-20 bg-yellow-100 border border-yellow-300 rounded px-3 py-1 text-xs text-yellow-800">
                <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                View Only - No Downloads or Full Screen
              </div>
              
              <iframe
                src={getSecureEmbedUrl(selectedPresentation.pptPath)}
                className="w-full h-full border-0"
                title={selectedPresentation.lectureName || 'Presentation'}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                referrerPolicy="no-referrer"
                loading="lazy"
                style={{
                  pointerEvents: 'auto',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none'
                }}
                onLoad={(e) => {
                  // Additional security: try to disable context menu on iframe
                  try {
                    const iframe = e.target;
                    if (iframe.contentDocument) {
                      iframe.contentDocument.addEventListener('contextmenu', (e) => e.preventDefault());
                      iframe.contentDocument.addEventListener('keydown', (e) => {
                        if (e.ctrlKey || e.metaKey) {
                          const key = e.key.toLowerCase();
                          if (['s', 'd', 'p', 'o', 'c', 'v', 'x'].includes(key)) {
                            e.preventDefault();
                            return false;
                          }
                        }
                        // Prevent F11 (full screen)
                        if (e.key === 'F11') {
                          e.preventDefault();
                          return false;
                        }
                      });
                    }
                  } catch (error) {
                    // Cross-origin restrictions may prevent this
                    console.log('Security measures applied to iframe');
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CoursePresentations; 
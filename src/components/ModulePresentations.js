import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
/* Split out: pdf.js is a large dependency and only needed once a deck is opened. */
const SecurePdfViewer = lazy(() => import('./SecurePdfViewer'));

const ModulePresentations = () => {
  const { moduleId } = useParams();
  const [presentations, setPresentations] = useState([]);
  const [moduleInfo, setModuleInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPresentation, setSelectedPresentation] = useState(null);
  const [showPresentation, setShowPresentation] = useState(false);

  useEffect(() => {
    const fetchPresentations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch presentations for the module
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URI}/api/modules/${moduleId}/presentations`);
        
        console.log('Presentations response:', response);
        console.log('Response data:', response.data);
        
        // Handle the API response format
        if (response.data && response.data.success) {
          const presentationsData = response.data.data || [];
          const moduleInfoData = {
            moduleId: response.data.moduleId,
            count: response.data.count
          };
          
          console.log('Processed presentations data:', presentationsData);
          console.log('Module info data:', moduleInfoData);
          
          setPresentations(presentationsData);
          setModuleInfo(moduleInfoData);
        } else {
          // Handle other response formats
          let presentationsData = response.data;
          let moduleInfoData = {};
          
          if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
            if (Array.isArray(response.data.topics)) {
              presentationsData = response.data.topics;
            } else if (Array.isArray(response.data.data)) {
              presentationsData = response.data.data;
            } else if (Array.isArray(response.data.items)) {
              presentationsData = response.data.items;
            } else {
              presentationsData = [response.data];
            }
            moduleInfoData = response.data.moduleInfo || response.data.module || {};
          } else if (Array.isArray(response.data)) {
            presentationsData = response.data;
          } else {
            presentationsData = [];
          }
          
          if (!Array.isArray(presentationsData)) {
            presentationsData = [];
          }
          
          setPresentations(presentationsData);
          setModuleInfo(moduleInfoData);
        }
        
      } catch (err) {
        console.error('Error fetching presentations:', err);
        console.error('Error details:', err.response?.data || err.message);
        setError('Failed to load presentations. Please try again later.');
        
        // Fallback data for development
        setPresentations([
          {
            _id: "pres1",
            courseId: "CS101",
            moduleId: "MOD001",
            topicId: "TOP001",
            lectureName: "Variables and Data Types",
            pptId: "PPT001",
            pptPath: "https://example.com/presentations/variables.pptx",
            description: "Introduction to variables and basic data types",
            order: 1,
            createdAt: "2024-01-15T00:00:00.000Z"
          }
        ]);
        setModuleInfo({
          moduleId: "MOD001",
          count: 1
        });
      } finally {
        setLoading(false);
      }
    };

    if (moduleId) {
      fetchPresentations();
    }
  }, [moduleId]);

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

  /* The list response no longer carries a storage reference at all. Opening
     a deck asks the API where to load it from, and the API answers with its
     own relay endpoint — so the bucket URL never reaches this browser. Held
     in state, not on the record, so it goes away when the modal closes. */
  const [viewerUrl, setViewerUrl] = useState(null);
  const [viewerKind, setViewerKind] = useState('other');
  const [viewerError, setViewerError] = useState(null);

  const handleViewPresentation = async (presentation) => {
    setSelectedPresentation(presentation);
    setShowPresentation(true);
    setViewerUrl(null);
    setViewerError(null);

    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URI}/api/presentations/${presentation.pptId}/link`
      );
      const link = res.data?.data?.url;
      if (!link) throw new Error('No link returned');
      setViewerKind(res.data?.data?.kind || 'other');
      setViewerUrl(link);
    } catch (err) {
      console.error('Could not open presentation:', err);
      setViewerError('This presentation could not be opened. Please try again.');
    }
    
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
    setViewerUrl(null);
    setViewerError(null);
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

  console.log(presentations);
  return (
    <section className="resource-page">
      <div className="ark-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="resource-layout">
            <div className="resource-content">
              {/* Header */}
              <div className="resource-header">
                <Link
                  to="/#teaching"
                  className="resource-back"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Teaching
                </Link>
                
                <h1 className="resource-title">
                  {moduleInfo?.moduleName ? `${moduleInfo.moduleName} Presentations` : 'Module Presentations'}
                </h1>
                {moduleInfo?.count > 0 && (
                  <p className="resource-count">Total Presentations: {moduleInfo.count}</p>
                )}
              </div>

              {/* Loading State */}
              {loading && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-brand-600 hover:bg-brand-500 transition ease-in-out duration-150 cursor-not-allowed">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading topics and presentations...
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
                        <h3 className="text-sm font-medium text-red-800">Error loading topics and presentations</h3>
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
                      <p className="mt-1 text-sm text-gray-500">No presentations have been uploaded for this module yet.</p>
                    </div>
                  ) : (
                    <div className="resource-list">
                      {presentations.map((presentation) => (
                        <div
                          key={presentation._id || presentation.id || Math.random()}
                          className="resource-item"
                        >
                          <div className="resource-item__row">
                            <div className="resource-item__copy">
                              <div className="mb-2">
                                <span className="resource-topic">
                                  {presentation.topicName || 'Unknown Topic'}
                                </span>
                              </div>
                              <h3 className="resource-item__title">
                                {presentation.lectureName || presentation.title || 'Untitled Presentation'}
                              </h3>
                              <p className="resource-description">
                                {presentation.description || 'No description available'}
                              </p>
                              <div className="resource-meta">
                                <span>Created: {new Date(presentation.createdAt || presentation.uploadDate || new Date()).toLocaleDateString()}</span>
                                {presentation.order > 0 && (
                                  <span>Order: {presentation.order}</span>
                                )}
                              </div>
                            </div>
                            <div className="resource-item__actions">
                              <button
                                onClick={() => handleViewPresentation(presentation)}
                                className="btn-primary"
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
        <div className="pv-shell fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl h-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <div>
                <h3 className="type-dialog-title text-gray-900">
                  {selectedPresentation.lectureName || selectedPresentation.title}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-sm text-gray-500">
                    {selectedPresentation.courseId || 'Unknown Course'}
                  </p>
                </div>
              </div>
              <button
                aria-label="Close presentation"
                onClick={closePresentation}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Presentation Content */}
            <div className="flex-1 p-4 relative overflow-hidden">
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
              

              {/* The frame stays empty until the link arrives. Without this the
                  reader sees a blank white rectangle for the round-trip. */}
              {!viewerUrl && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-white">
                  {viewerError ? (
                    <p className="text-sm text-red-600">{viewerError}</p>
                  ) : (
                    <div className="text-center">
                      <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-gray-200 border-t-brand-600"></div>
                      <p className="mt-3 text-sm text-gray-500">Preparing secure view…</p>
                    </div>
                  )}
                </div>
              )}
              {/* A PDF is painted onto canvases in this page: no document URL,
                  nothing selectable, and the print stylesheet applies because
                  the pages belong to us. PowerPoint cannot be rendered that way,
                  so those few decks still go through the third-party viewer —
                  re-save them as PDF to get the same treatment. */}
              {viewerUrl && viewerKind === 'pdf' ? (
                <Suspense fallback={<div className="flex h-full items-center justify-center text-sm text-gray-500">Loading viewer…</div>}>
                  <SecurePdfViewer url={viewerUrl} />
                </Suspense>
              ) : viewerUrl ? (
                <iframe
                  src={getSecureEmbedUrl(viewerUrl)}
                  className="w-full h-full border-0 rounded"
                  title={selectedPresentation.lectureName || 'Presentation'}
                  sandbox="allow-scripts allow-same-origin allow-forms"
                  allow="fullscreen 'none'"
                  referrerPolicy="no-referrer"
                />
              ) : null}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ModulePresentations; 
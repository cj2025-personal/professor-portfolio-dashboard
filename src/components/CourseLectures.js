import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

const CourseLectures = () => {
  const { courseId } = useParams();
  const [lectures, setLectures] = useState([]);
  const [courseInfo, setCourseInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [showLecture, setShowLecture] = useState(false);

  useEffect(() => {
    const fetchLectures = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URI}/api/courses/${courseId}/lectures`);
        // Expecting response: { success, count, courseId, data: [ { _id, courseId, lectureName, recordingPath, description, createdAt } ] }
        if (response.data && response.data.success) {
          setLectures(response.data.data || []);
          setCourseInfo({ courseId: response.data.courseId, count: response.data.count });
        } else {
          setLectures([]);
          setCourseInfo({});
        }
      } catch (err) {
        setError('Failed to load lectures. Please try again later.');
        setLectures([
          {
            _id: 'sample1',
            courseId: 'CS101',
            lectureName: 'Sample Lecture',
            recordingPath: 'https://www.w3schools.com/html/mov_bbb.mp4',
            description: 'Sample lecture video.',
            createdAt: '2024-01-15T00:00:00.000Z',
          },
        ]);
        setCourseInfo({ courseId: 'CS101', count: 1 });
      } finally {
        setLoading(false);
      }
    };
    if (courseId) fetchLectures();
  }, [courseId]);

  // Security: Prevent right-click, download, fullscreen, etc. in modal
  useEffect(() => {
    if (showLecture) {
      document.body.style.userSelect = 'none';
      const prevent = (e) => {
        if (e.type === 'contextmenu') e.preventDefault();
        if (e.key === 'F11' || (e.ctrlKey && ['s', 'd', 'p', 'o'].includes(e.key.toLowerCase()))) e.preventDefault();
      };
      document.addEventListener('contextmenu', prevent);
      document.addEventListener('keydown', prevent);
      return () => {
        document.body.style.userSelect = '';
        document.removeEventListener('contextmenu', prevent);
        document.removeEventListener('keydown', prevent);
      };
    }
  }, [showLecture]);

  const handleViewLecture = (lecture) => {
    setSelectedLecture(lecture);
    setShowLecture(true);
  };
  const closeLecture = () => {
    setShowLecture(false);
    setSelectedLecture(null);
  };

  // Helper to render video (HTML5 or iframe)
  const renderVideo = (url) => {
    if (!url) return <div>No video available.</div>;
    // YouTube/Vimeo
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
      return (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&fs=0&disablekb=1`}
          title="Lecture Video"
          className="w-full h-96 border-0 rounded"
          allow="autoplay; encrypted-media"
          allowFullScreen={false}
          sandbox="allow-scripts allow-same-origin"
        />
      );
    }
    if (url.includes('vimeo.com')) {
      const videoId = url.split('/').pop();
      return (
        <iframe
          src={`https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0&fullscreen=0`}
          title="Lecture Video"
          className="w-full h-96 border-0 rounded"
          allow="autoplay; encrypted-media"
          allowFullScreen={false}
          sandbox="allow-scripts allow-same-origin"
        />
      );
    }
    // HTML5 video
    return (
      <video
        src={url}
        controls
        controlsList="nodownload nofullscreen noremoteplayback"
        disablePictureInPicture
        className="w-full h-96 rounded"
        style={{ background: '#000' }}
        onContextMenu={e => e.preventDefault()}
      >
        Your browser does not support the video tag.
      </video>
    );
  };

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
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="resource-title">
                      Course {courseInfo?.courseId || courseId} Lecture Videos
                    </h1>
                    {courseInfo?.count > 0 && (
                      <p className="resource-count">Total Lectures: {courseInfo.count}</p>
                    )}
                  </div>
                  <Link
                    to={`/course/${courseId}/discussions`}
                    className="btn-secondary"
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
                  <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-brand-600 hover:bg-brand-500 transition ease-in-out duration-150 cursor-not-allowed">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading lectures...
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
                        <h3 className="text-sm font-medium text-red-800">Error loading lectures</h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>{error}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Lectures List */}
              {!loading && !error && (
                <div className="space-y-6">
                  {lectures.length === 0 ? (
                    <div className="text-center py-8">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No lectures</h3>
                      <p className="mt-1 text-sm text-gray-500">No lecture videos have been uploaded for this course yet.</p>
                    </div>
                  ) : (
                    <div className="resource-list">
                      {lectures.map((lecture) => (
                        <div
                          key={lecture._id || lecture.id || Math.random()}
                          className="resource-item"
                        >
                          <div className="resource-item__row">
                            <div className="resource-item__copy">
                              <div className="mb-2">
                                <span className="resource-topic">
                                  {lecture.courseId || courseId}
                                </span>
                              </div>
                              <h3 className="resource-item__title">
                                {lecture.lectureName || lecture.title || 'Untitled Lecture'}
                              </h3>
                              <p className="resource-description">
                                {lecture.description || 'No description available'}
                              </p>
                              <div className="resource-meta">
                                <span>Created: {new Date(lecture.createdAt || lecture.uploadDate || new Date()).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="resource-item__actions">
                              <button
                                onClick={() => handleViewLecture(lecture)}
                                className="btn-primary"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                View Video
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
      {/* Lecture Modal */}
      {showLecture && selectedLecture && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl h-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <div>
                <h3 className="type-dialog-title text-gray-900">
                  {selectedLecture.lectureName || selectedLecture.title}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-sm text-gray-500">
                    {selectedLecture.courseId || courseId}
                  </p>
                </div>
              </div>
              <button
                aria-label="Close lecture"
                onClick={closeLecture}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Video Content */}
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
              {renderVideo(selectedLecture.recordingPath)}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CourseLectures; 
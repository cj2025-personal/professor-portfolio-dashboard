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
                      Course {courseInfo?.courseId || courseId} Lecture Videos
                    </h1>
                    {courseInfo?.count && (
                      <p className="text-lg text-gray-600 mt-2">Total Lectures: {courseInfo.count}</p>
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
                    <div className="grid gap-6">
                      {lectures.map((lecture) => (
                        <div
                          key={lecture._id || lecture.id || Math.random()}
                          className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="mb-2">
                                <span className="text-sm font-medium text-crimson-600 bg-crimson-50 px-2 py-1 rounded">
                                  {lecture.courseId || courseId}
                                </span>
                              </div>
                              <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {lecture.lectureName || lecture.title || 'Untitled Lecture'}
                              </h3>
                              <p className="text-gray-600 mb-3">
                                {lecture.description || 'No description available'}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>Created: {new Date(lecture.createdAt || lecture.uploadDate || new Date()).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <button
                                onClick={() => handleViewLecture(lecture)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-crimson-600 hover:bg-crimson-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-crimson-500"
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
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedLecture.lectureName || selectedLecture.title}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-sm text-gray-500">
                    {selectedLecture.courseId || courseId}
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
              {/* Warning message */}
              <div className="absolute top-2 left-2 z-20 bg-yellow-100 border border-yellow-300 rounded px-3 py-1 text-xs text-yellow-800">
                <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                View Only - No Downloads or Full Screen
              </div>
              {renderVideo(selectedLecture.recordingPath)}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CourseLectures; 
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import GoogleAuth from './GoogleAuth';
import { 
  ChatBubbleLeftRightIcon, 
  ClockIcon, 
  UserIcon,
  FlagIcon,
  EyeIcon,
  LockClosedIcon,
  KeyIcon
} from '@heroicons/react/24/outline';

const DiscussionTopics = () => {
  const { courseId } = useParams();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessId, setAccessId] = useState('');
  const [validatedTopics, setValidatedTopics] = useState(new Set());
  const [validating, setValidating] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  const fetchTopics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URI}/api/discussions/topics/course/${courseId}`);
      console.log('API Response:', response.data);
      
      // Extract data from paginated response
      const topicsData = response.data?.data || [];
      console.log('Extracted topics:', topicsData);
      setTopics(topicsData);
    } catch (err) {
      console.error('Error fetching topics:', err);
      setError('Failed to load discussion topics. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchTopics();
    // Check if user is already authenticated
    const savedUser = localStorage.getItem('discussionUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, [courseId, fetchTopics]);

  const validateAccessId = async (topicId) => {
    if (!accessId.trim()) {
      setError('Please enter an access ID');
      return;
    }

    try {
      setValidating(true);
      setError(null);
      
      console.log('Validating access ID for topic:', topicId);
      console.log('Access ID being sent:', accessId);
      
      // Try sending access ID as query parameter
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URI}/api/discussions/topics/${topicId}?accessId=${encodeURIComponent(accessId)}`);
      
      console.log('Validation response:', response.data);
      
      if (response.data.success) {
        setValidatedTopics(prev => new Set([...prev, topicId]));
        setError(null);
      } else {
        setError('Invalid access ID. Please try again.');
      }
    } catch (err) {
      console.error('Error validating access ID:', err);
      console.error('Error response:', err.response?.data);
      setError('Invalid access ID or topic not found. Please try again.');
    } finally {
      setValidating(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isTopicValidated = (topicId) => {
    return validatedTopics.has(topicId);
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setShowAuth(false);
  };

  const handleJoinDiscussion = () => {
    if (!currentUser) {
      setShowAuth(true);
    }
  };

  if (loading) {
    return (
      <div className="resource-page discussion-page">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="resource-page discussion-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            to="/#teaching"
            className="inline-flex items-center text-brand-600 hover:text-brand-700 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Teaching
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="resource-title text-gray-900 mb-2">
                Course Discussions
              </h1>
              <p className="text-gray-600">
                Join the conversation and share your thoughts anonymously
              </p>
            </div>
            <div>
              {currentUser ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">
                    Signed in as: {currentUser.pseudonym}
                  </span>
                  <button
                    onClick={() => {
                      setCurrentUser(null);
                      localStorage.removeItem('discussionUser');
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleJoinDiscussion}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Join Discussion
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 bg-red-50 border border-red-200 rounded-md p-4"
          >
            <p className="text-red-800">{error}</p>
          </motion.div>
        )}

        {/* Topics List */}
        <div className="space-y-4">
          {!Array.isArray(topics) || topics.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No topics yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Be the first to start a discussion!
              </p>
            </motion.div>
          ) : (
            topics.map((topic, index) => (
              <motion.div
                key={topic._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="type-card-title text-gray-900">
                          {topic.title}
                        </h3>
                        {topic.requireAccessId && (
                          <LockClosedIcon
                            className="h-5 w-5 text-orange-500 flex-none"
                            role="img"
                            aria-label="Requires an access ID"
                          />
                        )}
                      </div>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {topic.content}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                        <div className="flex items-center">
                          <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                          <span>{topic.commentCount || 0} comments</span>
                        </div>
                        <div className="flex items-center">
                          <EyeIcon className="h-4 w-4 mr-1" />
                          <span>{topic.viewCount || 0} views</span>
                        </div>
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          <span>{formatDate(topic.createdAt)}</span>
                        </div>
                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 mr-1" />
                          <span>{topic.author || 'Anonymous'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <FlagIcon className="h-5 w-5 text-gray-400 hover:text-red-500" />
                    </div>
                  </div>

                  {/* Access ID Validation Section */}
                  {topic.requireAccessId && !isTopicValidated(topic._id) && currentUser && (
                    <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-md">
                      <div className="flex items-center space-x-3">
                        <KeyIcon className="h-5 w-5 text-orange-600" />
                        <div className="flex-1">
                          <p className="text-sm text-orange-800 mb-2">
                            This discussion requires an access ID to participate.
                          </p>
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={accessId}
                              onChange={(e) => setAccessId(e.target.value)}
                              placeholder="Enter access ID"
                              className="flex-1 px-3 py-2 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                            />
                            <button
                              onClick={() => validateAccessId(topic._id)}
                              disabled={validating || !accessId.trim()}
                              className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                            >
                              {validating ? 'Validating...' : 'Validate'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Show message when user is not authenticated */}
                  {topic.requireAccessId && !isTopicValidated(topic._id) && !currentUser && (
                    <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
                      <div className="flex items-center space-x-3">
                        <LockClosedIcon className="h-5 w-5 text-gray-600" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">
                            Please sign in to access this discussion.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-4 flex justify-end">
                                         {isTopicValidated(topic._id) ? (
                       <Link
                         to={`/course/${courseId}/discussions/${topic._id}?accessId=${encodeURIComponent(accessId)}`}
                         className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                       >
                         <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                         View Discussion
                       </Link>
                     ) : (
                      <div className="text-sm text-gray-500">
                        {topic.requireAccessId ? 'Enter access ID to participate' : 'Click to view'}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Authentication Modal */}
      {showAuth && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="type-card-title text-gray-900">
                Join the Discussion
              </h3>
              <button
                onClick={() => setShowAuth(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <GoogleAuth onAuthSuccess={handleAuthSuccess} />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default DiscussionTopics; 
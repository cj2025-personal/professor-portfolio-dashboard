import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
  ArrowLeftIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  UserIcon,
  FlagIcon,
  ArrowUturnLeftIcon,
  PaperAirplaneIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';

const DiscussionComments = () => {
  const { courseId, topicId } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const accessId = searchParams.get('accessId');
  
  const [topic, setTopic] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeReplyForm, setActiveReplyForm] = useState(null);
  const [replyTexts, setReplyTexts] = useState({});
  const [currentUser, setCurrentUser] = useState(null);


  useEffect(() => {
    fetchTopicAndComments();
    // Check if user is already authenticated
    const savedUser = localStorage.getItem('discussionUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    // fetchTopicAndComments is defined below and closes over topicId/accessId,
    // which are already the triggers here. Adding it would re-run the fetch on
    // every render instead of only when the topic or access id changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId, accessId]);

  const fetchTopicAndComments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch topic details with access ID if available
      const topicUrl = accessId 
        ? `${process.env.REACT_APP_BACKEND_URI}/api/discussions/topics/${topicId}?accessId=${encodeURIComponent(accessId)}`
        : `${process.env.REACT_APP_BACKEND_URI}/api/discussions/topics/${topicId}`;
      
      const topicResponse = await axios.get(topicUrl);
      console.log('Topic response:', topicResponse.data);
      
      // Handle different response structures
      const topicData = topicResponse.data?.data || topicResponse.data;
      setTopic(topicData);
      
      // Fetch comments with access ID if available
      const commentsUrl = accessId 
        ? `${process.env.REACT_APP_BACKEND_URI}/api/discussions/comments/topic/${topicId}?accessId=${encodeURIComponent(accessId)}`
        : `${process.env.REACT_APP_BACKEND_URI}/api/discussions/comments/topic/${topicId}`;
      
      const commentsResponse = await axios.get(commentsUrl);
      console.log('Comments response:', commentsResponse.data);
      // Handle paginated response for comments too
      const commentsData = commentsResponse.data?.data || commentsResponse.data || [];
      console.log('Processed comments:', commentsData);
      setComments(commentsData);
    } catch (err) {
      console.error('Error fetching topic and comments:', err);
      setError('Failed to load discussion. Please try again later.');
    } finally {
      setLoading(false);
    }
  };



  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
         // Determine if this is a reply or a new comment
     const isReply = replyTo && activeReplyForm;
    const commentText = isReply ? (replyTexts[replyTo._id || replyTo.id] || '') : newComment;
    
    if (!commentText.trim()) return;

    try {
      setSubmitting(true);
      const commentUrl = accessId 
        ? `${process.env.REACT_APP_BACKEND_URI}/api/discussions/comments?accessId=${encodeURIComponent(accessId)}`
        : `${process.env.REACT_APP_BACKEND_URI}/api/discussions/comments`;
      
      // Prepare comment data according to your backend API
      const commentData = {
        topicId: topicId,
        courseId: courseId,
        content: commentText,
        parentCommentId: replyTo?._id || replyTo?.id || null,
        isAnonymous: !currentUser,
        author: currentUser?.pseudonym || currentUser?.pseudoName || 'Anonymous'
      };

      // Add authorization header if user is authenticated
      const headers = {
        'Content-Type': 'application/json'
      };
      
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await axios.post(commentUrl, commentData, { headers });
      
      console.log('Comment submission response:', response.data);
      
      // Handle different response structures
      const newCommentData = response.data?.data || response.data;
      
      // Add the new comment to the beginning of the list
      setComments(prevComments => {
        console.log('Previous comments:', prevComments);
        console.log('New comment data:', newCommentData);
        const updatedComments = [newCommentData, ...prevComments];
        console.log('Updated comments:', updatedComments);
        return updatedComments;
      });
      
      // Clear the appropriate text field
      if (isReply) {
        setReplyTexts(prev => ({
          ...prev,
          [replyTo._id || replyTo.id]: ''
        }));
      } else {
        setNewComment('');
      }
      
             setReplyTo(null);
       setActiveReplyForm(null);
    } catch (err) {
      console.error('Error submitting comment:', err);
      setError('Failed to submit comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = (comment) => {
    setReplyTo(comment);
    setActiveReplyForm(comment._id || comment.id);
    // Initialize reply text for this comment if not already set
    if (!replyTexts[comment._id || comment.id]) {
      setReplyTexts(prev => ({
        ...prev,
        [comment._id || comment.id]: ''
      }));
    }
  };

  const handleCancelReply = () => {
    setReplyTo(null);
    setActiveReplyForm(null);
    // Clear the reply text for the current comment
    if (replyTo) {
      setReplyTexts(prev => ({
        ...prev,
        [replyTo._id || replyTo.id]: ''
      }));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  const renderComment = (comment, level = 0) => {
    // Prevent infinite recursion by limiting nesting level
    if (level > 10) {
      console.warn('Comment nesting level too deep, stopping recursion');
      return null;
    }
    
    const replies = comments.filter(c => c.parentId === comment._id || c.parentId === comment.id);
    
    return (
      <motion.div
        key={comment._id || comment.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`bg-white rounded-xl shadow-sm border-l-4 border-blue-500 ${level > 0 ? 'ml-8' : ''}`}
      >
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <UserIcon className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-900">
                  {comment.author || 'Anonymous'}
                </span>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-500">{formatDate(comment.createdAt)}</span>
              </div>
              <p className="text-gray-700 mb-3">{comment.content}</p>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleReply(comment)}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-700"
                >
                  <ArrowUturnLeftIcon className="h-4 w-4 mr-1" />
                  Reply
                </button>
                <button className="flex items-center text-sm text-gray-500 hover:text-red-500">
                  <FlagIcon className="h-4 w-4 mr-1" />
                  Flag
                </button>
              </div>
            </div>
          </div>
        </div>
        
                 {/* Reply form for this comment */}
         {activeReplyForm === (comment._id || comment.id) && (
           <motion.div
             initial={{ opacity: 0, height: 0 }}
             animate={{ opacity: 1, height: 'auto' }}
             className="px-4 pb-4"
           >
             <form onSubmit={handleSubmitComment}>
               <div className="mb-3">
                 <textarea
                   value={replyTexts[comment._id || comment.id] || ''}
                   onChange={(e) => setReplyTexts(prev => ({
                     ...prev,
                     [comment._id || comment.id]: e.target.value
                   }))}
                   rows={3}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                   placeholder={`Reply to ${replyTo.content.substring(0, 50)}...`}
                   required
                 />
               </div>
               <div className="flex justify-end space-x-2">
                 <button
                   type="button"
                   onClick={handleCancelReply}
                   className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                 >
                   Cancel
                 </button>
                 <button
                   type="submit"
                   disabled={submitting}
                   className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                 >
                   {submitting ? 'Posting...' : 'Post Reply'}
                 </button>
               </div>
             </form>
           </motion.div>
         )}
        
        {/* Render replies */}
        {replies.length > 0 && (
          <div className="border-t border-gray-100">
            {replies.map(reply => {
              // Prevent circular references
              if (reply._id === comment._id || reply.id === comment.id) {
                console.warn('Circular reference detected, skipping reply');
                return null;
              }
              return renderComment(reply, level + 1);
            })}
          </div>
        )}
      </motion.div>
    );
  };

  const topLevelComments = comments.filter(comment => !comment.parentId);

  return (
    <div className="resource-page discussion-page">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            to={`/course/${courseId}/discussions`}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to discussions
          </Link>
          
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center space-x-2 mb-2">
              <h1 className="resource-title text-gray-900">
                {loading ? 'Loading...' : (topic?.title || 'Topic not found')}
              </h1>
              {topic?.requireAccessId && (
                <LockClosedIcon
                  className="h-5 w-5 text-orange-500 flex-none"
                  role="img"
                  aria-label="Requires an access ID"
                />
              )}
            </div>
            <p className="text-gray-600 mb-4">
              {loading ? 'Loading topic details...' : (topic?.content || '')}
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
              <div className="flex items-center">
                <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                <span>{comments.length} comments</span>
              </div>
              <div className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                <span>{formatDate(topic?.createdAt)}</span>
              </div>
              <div className="flex items-center">
                <UserIcon className="h-4 w-4 mr-1" />
                <span>{topic?.author || 'Anonymous'}</span>
              </div>
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

        

        {/* Comments */}
        <div className="space-y-4 mb-8">
          {topLevelComments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-white rounded-xl shadow"
            >
              <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No comments yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Be the first to share your thoughts!
              </p>
            </motion.div>
          ) : (
            topLevelComments.map((comment, index) => 
              renderComment(comment, 0)
            )
          )}
        </div>

                          {/* New Comment Form */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-white rounded-xl shadow p-6"
         >
            <h3 className="type-subheading text-gray-900 mb-4">Add a comment</h3>
            <form onSubmit={handleSubmitComment}>
              <div className="mb-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Share your thoughts anonymously..."
                  required
                />
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  {currentUser ? 
                    `Your comment will be posted as ${currentUser.pseudonym}` : 
                    'Your comment will be posted anonymously'
                  }
                </p>
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                  {submitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>
          </motion.div>
      </div>
    </div>
  );
};

export default DiscussionComments; 
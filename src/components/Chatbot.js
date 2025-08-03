import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your AI assistant. I can help you learn about Professor Johnson's research, courses, and background. Choose a category below or type your own question!",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [categories, setCategories] = useState([]);
  const [showCategories, setShowCategories] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    console.log('Categories state changed:', categories);
    console.log('Show categories:', showCategories);
  }, [categories, showCategories]);

  // Debug useEffect to check if component is mounting
  useEffect(() => {
    console.log('Chatbot component mounted, isOpen:', isOpen);
  }, []);

  useEffect(() => {
    // Check chatbot status and fetch categories on component mount
    console.log('Chatbot component mounted, fetching categories...');
    checkStatus();
    fetchCategories();
  }, []);

  const checkStatus = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URI}/api/chatbot/status`);
      const data = await response.json();
      setIsOnline(data.success);
    } catch (error) {
      console.error('Error checking chatbot status:', error);
      setIsOnline(false);
    }
  };

  const fetchCategories = async () => {
    console.log('=== fetchCategories function called ===');
    try {
      const backendUri = process.env.REACT_APP_BACKEND_URI;
      console.log('Backend URI:', backendUri);
      console.log('Fetching categories from:', `${backendUri}/api/chatbot/categories`);
      
      if (!backendUri) {
        console.error('REACT_APP_BACKEND_URI is not defined');
        setCategories([]);
        return;
      }
      
      console.log('Making axios request...');
      
      // Test if backend is accessible
      try {
        const testResponse = await fetch(`${backendUri}/api/chatbot/status`);
        console.log('Backend is accessible, status response:', testResponse.status);
      } catch (testError) {
        console.error('Backend accessibility test failed:', testError);
      }
      
      const response = await axios.get(`${backendUri}/api/chatbot/categories`);
      console.log('Categories response:', response.data);
      
      // Handle different possible response structures
      let categoriesData = [];
      if (response.data.success) {
        if (response.data.categories && typeof response.data.categories === 'object') {
          // Convert object structure to array format
          categoriesData = Object.entries(response.data.categories).map(([key, category]) => ({
            id: key,
            name: category.title,
            description: category.description,
            examples: category.examples,
            prompt: category.examples[0] // Use first example as default prompt
          }));
        } else {
          categoriesData = response.data.data || response.data.categories || response.data || [];
        }
      } else if (Array.isArray(response.data)) {
        categoriesData = response.data;
      } else if (response.data.data) {
        categoriesData = response.data.data;
      }
      
      console.log('Processed categories:', categoriesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      console.error('Error details:', error.response?.data || error.message);
      setCategories([]); // Set empty array on error
    }
  };

  const sendMessage = async (messageText = null) => {
    const textToSend = messageText || inputMessage.trim();
    if (!textToSend || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setShowCategories(false); // Hide categories after user sends a message

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URI}/api/chatbot/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.text
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const botMessage = {
          id: Date.now() + 1,
          text: data.response,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
        
        // Show categories again after bot response
        setShowCategories(true);
      } else {
        const errorMessage = {
          id: Date.now() + 1,
          text: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
        setShowCategories(true);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm sorry, I'm experiencing technical difficulties. Please try again later.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setShowCategories(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    sendMessage(category.prompt || category.name);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <motion.button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            console.log('Chatbot opened, fetching categories...');
            fetchCategories();
          }
        }}
        className="fixed bottom-6 right-6 z-50 bg-crimson-600 hover:bg-crimson-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <ChatBubbleLeftRightIcon className="h-6 w-6" />
        )}
      </motion.button>

      {/* Chatbot Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
                         className="fixed bottom-20 right-6 z-40 w-96 h-[500px] bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col"
          >
            {/* Header */}
            <div className="bg-crimson-600 text-white p-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 ${isOnline ? 'bg-green-400' : 'bg-red-400'} rounded-full`}></div>
                  <span className="font-semibold">AI Assistant</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <p className="text-xs text-crimson-100 mt-1">
                Ask me about research, courses, or anything else!
              </p>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-crimson-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-crimson-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </motion.div>
              ))}
              
              {/* Categories */}
              {showCategories && categories.length > 0 && (
                console.log('Rendering categories:', categories) || true
              ) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 text-gray-800 max-w-xs px-3 py-2 rounded-lg">
                    <p className="text-sm font-medium mb-2">Quick Categories:</p>
                                         <div className="space-y-1">
                       {categories.map((category, index) => (
                         <button
                           key={category.id || index}
                           onClick={() => handleCategoryClick(category)}
                           disabled={isLoading}
                           className="block w-full text-left text-xs px-2 py-1 rounded bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
                         >
                           <div className="font-medium">{category.name}</div>
                           {category.description && (
                             <div className="text-gray-500 text-xs">{category.description}</div>
                           )}
                         </button>
                       ))}
                     </div>
                  </div>
                </motion.div>
              )}
              
                             {/* Debug info for categories */}
               {showCategories && categories.length === 0 && (
                 <motion.div
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="flex justify-start"
                 >
                   <div className="bg-gray-100 text-gray-800 max-w-xs px-3 py-2 rounded-lg">
                     <p className="text-sm text-gray-600">Loading categories...</p>
                     <button 
                       onClick={() => {
                         console.log('Manual fetch triggered');
                         fetchCategories();
                       }}
                       className="mt-2 text-xs bg-blue-500 text-white px-2 py-1 rounded"
                     >
                       Retry Fetch
                     </button>
                   </div>
                 </motion.div>
               )}
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 text-gray-800 max-w-xs px-3 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-crimson-500 focus:border-transparent disabled:bg-gray-100"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-crimson-600 hover:bg-crimson-700 disabled:bg-gray-400 text-white p-2 rounded-lg transition-colors"
                >
                  <PaperAirplaneIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot; 
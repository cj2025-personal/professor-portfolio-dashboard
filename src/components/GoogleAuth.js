import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UserIcon, UserCircleIcon, ArrowRightIcon, ShieldCheckIcon, EyeIcon
} from '@heroicons/react/24/outline';

const GoogleAuth = ({ onAuthSuccess, onGuestMode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPseudonymModal, setShowPseudonymModal] = useState(false);
  const [pseudonym, setPseudonym] = useState('');
  const [authMode, setAuthMode] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('discussionUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsAuthenticated(true);
      onAuthSuccess(userData);
    }
  }, [onAuthSuccess]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setAuthMode('google');
    
    try {
      // Load Google Sign-In API
      if (!window.google) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
        
        script.onload = () => {
          initializeGoogleSignIn();
        };
      } else {
        initializeGoogleSignIn();
      }
    } catch (error) {
      console.error('Google OAuth error:', error);
      setLoading(false);
    }
  };

  const initializeGoogleSignIn = () => {
    window.google.accounts.id.initialize({
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse
    });

    window.google.accounts.id.prompt();
  };

  const handleCredentialResponse = async (response) => {
    try {
      console.log('Google credential response received');
      // Send ID token to backend
      const authResponse = await fetch(`${process.env.REACT_APP_BACKEND_URI}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken: response.credential })
      });

      if (authResponse.ok) {
        const authData = await authResponse.json();
        console.log('Backend auth response:', authData);
        const userData = authData.data.user;
        const token = authData.data.token;

        console.log('User data from backend:', userData);
        console.log('User has pseudoName:', !!userData.pseudoName);
        console.log('requiresPseudoName flag:', authData.data.requiresPseudoName);

        // Store JWT token
        localStorage.setItem('token', token);
        
        // Check if user needs to set pseudo name using the requiresPseudoName flag
        if (authData.data.requiresPseudoName) {
          console.log('User needs to set pseudonym, showing modal');
          setAuthMode('google'); // Set auth mode for Google user
          setShowPseudonymModal(true);
          setUser(userData);
        } else {
          console.log('User already has pseudonym, proceeding to dashboard');
          // User already has a pseudo name
          const userWithPseudonym = { ...userData, pseudonym: userData.pseudoName };
          setUser(userWithPseudonym);
          setIsAuthenticated(true);
          localStorage.setItem('discussionUser', JSON.stringify(userWithPseudonym));
          onAuthSuccess(userWithPseudonym);
        }
      } else {
        console.error('Authentication failed');
      }
    } catch (error) {
      console.error('Error during authentication:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = async () => {
    setAuthMode('guest');
    setShowPseudonymModal(true);
  };

  const handlePseudonymSubmit = async () => {
    if (!pseudonym.trim()) return;
    
    setLoading(true);
    
    try {
      let userData;
      
      if (authMode === 'guest') {
        // Create guest user
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URI}/api/auth/guest`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ pseudoName: pseudonym.trim() })
        });

        if (response.ok) {
          const authData = await response.json();
          userData = authData.data.user;
          localStorage.setItem('token', authData.data.token);
        }
      } else {
        // Update existing user's pseudo name
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URI}/api/auth/pseudo-name`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ pseudoName: pseudonym.trim() })
        });

        if (response.ok) {
          const authData = await response.json();
          userData = authData.data.user;
        }
      }

      if (userData) {
        const userWithPseudonym = { ...userData, pseudonym: userData.pseudoName };
        setUser(userWithPseudonym);
        setIsAuthenticated(true);
        setShowPseudonymModal(false);
        localStorage.setItem('discussionUser', JSON.stringify(userWithPseudonym));
        onAuthSuccess(userWithPseudonym);
      }
    } catch (error) {
      console.error('Error saving pseudo name:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setAuthMode(null);
    localStorage.removeItem('discussionUser');
    localStorage.removeItem('token');
    onAuthSuccess(null);
  };

  if (isAuthenticated && user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto"
      >
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            {user.isGuest ? (
              <EyeIcon className="h-12 w-12 text-gray-400" />
            ) : (
              <UserCircleIcon className="h-12 w-12 text-blue-500" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Welcome, {user.pseudonym || user.pseudoName}!
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {user.isGuest ? 'You are browsing as a guest' : 'You are signed in with Google'}
          </p>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Sign Out
          </button>
        </div>
      </motion.div>
    );
  }

  if (showPseudonymModal) {
    console.log('Rendering pseudonym modal, authMode:', authMode);
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
        >
          <div className="text-center">
            <UserIcon className="mx-auto h-12 w-12 text-blue-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {authMode === 'guest' ? 'Create Guest Account' : 'Set Your Display Name'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {authMode === 'guest' 
                ? 'Enter a display name to participate in discussions'
                : 'Choose how you want to appear in discussions'
              }
            </p>
            <div className="space-y-4">
              <input
                type="text"
                value={pseudonym}
                onChange={(e) => setPseudonym(e.target.value)}
                placeholder="Enter your display name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={30}
              />
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPseudonymModal(false)}
                  className="flex-1 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePseudonymSubmit}
                  disabled={loading || !pseudonym.trim()}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto"
    >
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <ShieldCheckIcon className="h-12 w-12 text-blue-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Join the Discussion
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Choose how you'd like to participate in the discussion forum
        </p>
        
        <div className="space-y-3">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>
          
          <button
            onClick={handleGuestMode}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm bg-gray-600 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
          >
            <EyeIcon className="w-5 h-5 mr-3" />
            Continue as Guest
          </button>
        </div>
        
        <p className="text-xs text-gray-500 mt-4">
          Guest users can participate anonymously with a display name
        </p>
      </div>
    </motion.div>
  );
};

export default GoogleAuth; 
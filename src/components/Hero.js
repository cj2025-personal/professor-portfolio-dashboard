import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-32 h-32 border-2 border-crimson-800 rounded-full"></div>
        <div className="absolute top-40 right-20 w-24 h-24 border-2 border-crimson-800 transform rotate-45"></div>
        <div className="absolute bottom-40 left-20 w-16 h-16 border-2 border-crimson-800 rounded-full"></div>
        <div className="absolute bottom-20 right-10 w-20 h-20 border-2 border-crimson-800 transform rotate-12"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left column - Text content */}
          <div className="text-left relative">
            {/* Themed Illustration: Professor at desk with books and chart */}
            <div className="absolute -top-24 -left-32 hidden md:block z-0 opacity-80 pointer-events-none">
              <svg width="160" height="160" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="120" width="140" height="20" rx="6" fill="#fee2e2"/>
                <rect x="30" y="100" width="100" height="20" rx="6" fill="#fca5a5"/>
                <rect x="60" y="80" width="40" height="20" rx="6" fill="#991b1b"/>
                <rect x="70" y="40" width="20" height="40" rx="10" fill="#991b1b"/>
                <ellipse cx="80" cy="35" rx="15" ry="15" fill="#b91c1c"/>
                <rect x="75" y="25" width="10" height="10" rx="2" fill="#fff"/>
                <rect x="90" y="60" width="30" height="8" rx="2" fill="#fca5a5"/>
                <rect x="40" y="60" width="30" height="8" rx="2" fill="#fca5a5"/>
                <rect x="60" y="100" width="40" height="6" rx="2" fill="#fff"/>
                <rect x="60" y="110" width="40" height="6" rx="2" fill="#fff"/>
                <rect x="60" y="120" width="40" height="6" rx="2" fill="#fff"/>
                <rect x="100" y="80" width="8" height="20" rx="2" fill="#b91c1c"/>
                <rect x="52" y="80" width="8" height="20" rx="2" fill="#b91c1c"/>
              </svg>
            </div>
            {/* End Illustration */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-4xl md:text-5xl">
                <span className="block mb-2" style={{marginLeft: '30px'}}>Craig L. Johnson, Ph.D.</span>
                <span className="block text-crimson-600 text-lg sm:text-xl md:text-2xl font-medium" style={{marginLeft: '30px'}}>Paul H. O'Neill School of Public and Environmental Affairs</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl" style={{marginLeft: '30px'}}>
              Public finance scholar specializing in municipal finance, budgeting, and state and local borrowing.
              Expert in tax increment finance, economic development, and financial condition analysis. 
              </p>
              <div className="mt-5 sm:flex sm:justify-start md:mt-8" style={{marginLeft: '30px'}}>
                <div className="rounded-md shadow">
                  <a
                    href="#blogs"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-crimson-600 hover:bg-crimson-700 md:py-4 md:text-lg md:px-10 transition-all duration-200 transform hover:scale-105"
                  >
                    Visit my Substack Blog
                  </a>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <a
                    href="#contact"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-crimson-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-all duration-200 transform hover:scale-105"
                  >
                    Contact Me
                  </a>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right column - Image */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center items-center"
          >
            <div className="relative w-72 h-72 md:w-96 md:h-96 overflow-hidden border-4 border-crimson-100 shadow-xl bg-white rounded-2xl">
              <img
                src="/images/craig-johnson.jpg"
                alt="Craig Johnson"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Qcm9maWxlIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                }}
              />
              
              {/* Decorative elements around the image */}
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-crimson-600 rounded-full opacity-20"></div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-crimson-400 rounded-full opacity-30"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero; 
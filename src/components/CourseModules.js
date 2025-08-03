import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

const CourseModules = () => {
  const { courseId } = useParams();
  const [modules, setModules] = useState([]);
  const [courseInfo, setCourseInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch modules for the course
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URI}/api/courses/${courseId}/modules`);
        
        console.log('Modules response:', response);
        console.log('Response data:', response.data);
        
        // Handle the API response format
        if (response.data && response.data.success) {
          const modulesData = response.data.data || [];
          const courseInfoData = {
            courseId: response.data.courseId,
            count: response.data.count
          };
          
          console.log('Processed modules data:', modulesData);
          console.log('Course info data:', courseInfoData);
          
          setModules(modulesData);
          setCourseInfo(courseInfoData);
        } else {
          // Handle other response formats
          let modulesData = response.data;
          let courseInfoData = {};
          
          if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
            if (Array.isArray(response.data.modules)) {
              modulesData = response.data.modules;
            } else if (Array.isArray(response.data.data)) {
              modulesData = response.data.data;
            } else if (Array.isArray(response.data.items)) {
              modulesData = response.data.items;
            } else {
              modulesData = [response.data];
            }
            courseInfoData = response.data.courseInfo || response.data.course || {};
          } else if (Array.isArray(response.data)) {
            modulesData = response.data;
          } else {
            modulesData = [];
          }
          
          if (!Array.isArray(modulesData)) {
            modulesData = [];
          }
          
          setModules(modulesData);
          setCourseInfo(courseInfoData);
        }
        
      } catch (err) {
        console.error('Error fetching modules:', err);
        console.error('Error details:', err.response?.data || err.message);
        setError('Failed to load modules. Please try again later.');
        
        // Fallback data for development
        setModules([
          {
            _id: "module1",
            courseId: "CS101",
            moduleName: "Introduction to Programming",
            moduleId: "MOD001",
            description: "Basic programming concepts and fundamentals",
            order: 1,
            createdAt: "2024-01-15T00:00:00.000Z"
          },
          {
            _id: "module2",
            courseId: "CS101",
            moduleName: "Data Structures",
            moduleId: "MOD002",
            description: "Understanding arrays, linked lists, and basic data structures",
            order: 2,
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
      fetchModules();
    }
  }, [courseId]);

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
                      Course {courseInfo?.courseId || courseId} Modules
                    </h1>
                    {courseInfo?.count && (
                      <p className="text-lg text-gray-600 mt-2">Total Modules: {courseInfo.count}</p>
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
                    Loading modules...
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
                        <h3 className="text-sm font-medium text-red-800">Error loading modules</h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>{error}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Modules List */}
              {!loading && !error && (
                <div className="space-y-6">
                  {modules.length === 0 ? (
                    <div className="text-center py-8">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No modules</h3>
                      <p className="mt-1 text-sm text-gray-500">No modules have been created for this course yet.</p>
                    </div>
                  ) : (
                    <div className="grid gap-6">
                      {modules.map((module) => (
                        <div
                          key={module._id || module.id || Math.random()}
                          className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="mb-2">
                                <span className="text-sm font-medium text-crimson-600 bg-crimson-50 px-2 py-1 rounded">
                                  {module.moduleId || module.id}
                                </span>
                                {module.order && (
                                  <span className="ml-2 text-sm text-gray-500">
                                    Module {module.order}
                                  </span>
                                )}
                              </div>
                              <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {module.moduleName || module.name || 'Untitled Module'}
                              </h3>
                              <p className="text-gray-600 mb-4">
                                {module.description || 'No description available'}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>Created: {new Date(module.createdAt || new Date()).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="ml-4 flex flex-col space-y-2">
                              <Link
                                to={`/module/${module.moduleId || module.id}/presentations`}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-crimson-600 hover:bg-crimson-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-crimson-500"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                View Presentations
                              </Link>
                              <Link
                                to={`/module/${module.moduleId || module.id}/lectures`}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-crimson-500"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                View Lectures
                              </Link>
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
    </section>
  );
};

export default CourseModules; 
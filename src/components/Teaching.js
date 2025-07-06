import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Teaching = () => {
  const [activeTab, setActiveTab] = useState('current');
  const [activeCourse, setActiveCourse] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [courses, setCourses] = useState({ current: [], past: [] });
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modulesLoading, setModulesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modulesError, setModulesError] = useState(null);

  // Get the active course data
  const activeCourseData = courses.current.find(course => course.id === activeCourse);

  // Fetch modules for the active course
  const fetchModules = async (courseId) => {
    if (!courseId) {
      setModules([]);
      return;
    }

    // Check if backend URI is configured
    if (!process.env.REACT_APP_BACKEND_URI) {
      console.error('REACT_APP_BACKEND_URI is not configured');
      setModulesError('Backend URI is not configured. Please check your environment variables.');
      setModulesLoading(false);
      return;
    }

    // Get the active course data to use course code if needed
    const activeCourseData = courses.current.find(course => course.id === courseId);
    
    // Use course code if courseId is numeric (fallback)
    let effectiveCourseId = courseId;
    if (typeof courseId === 'number' && activeCourseData) {
      effectiveCourseId = activeCourseData.code;
      console.log('Using course code instead of numeric ID:', effectiveCourseId);
    }

    try {
      setModulesLoading(true);
      setModulesError(null);
      
      // First, test if the backend is reachable
      try {
        const testResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URI}/api/courses`);
        console.log('Backend connection test successful:', testResponse.status);
        console.log('Available courses:', testResponse.data);
      } catch (testErr) {
        console.error('Backend connection test failed:', testErr.response?.status, testErr.message);
        setModulesError('Cannot connect to backend server. Please check if the server is running.');
        setModulesLoading(false);
        return;
      }
      
      // Try different courseId formats
      const possibleCourseIds = [
        effectiveCourseId,
        activeCourseData?.code,
        activeCourseData?.id?.toString(),
        courseId.toString()
      ].filter(Boolean);
      
      console.log('Trying course IDs:', possibleCourseIds);
      
      let modulesFound = false;
      let lastError = null;
      
      for (const testCourseId of possibleCourseIds) {
        try {
          const testUrl = `${process.env.REACT_APP_BACKEND_URI}/api/courses/${testCourseId}/modules`;
          console.log('Testing URL:', testUrl);
          
          const testResponse = await axios.get(testUrl);
          console.log('Success with courseId:', testCourseId);
          
          // If we get here, the endpoint exists and works
          effectiveCourseId = testCourseId;
          modulesFound = true;
          break;
        } catch (testErr) {
          console.log('Failed with courseId:', testCourseId, 'Status:', testErr.response?.status);
          lastError = testErr;
        }
      }
      
      if (!modulesFound) {
        console.error('All courseId formats failed. Last error:', lastError);
        setModulesError(`Modules endpoint not found for any course ID format. Tried: ${possibleCourseIds.join(', ')}`);
        setModulesLoading(false);
        return;
      }
      
      const apiUrl = `${process.env.REACT_APP_BACKEND_URI}/api/courses/${effectiveCourseId}/modules`;
      console.log('=== MODULES API DEBUG ===');
      console.log('Original Course ID:', courseId);
      console.log('Effective Course ID:', effectiveCourseId);
      console.log('Course ID type:', typeof effectiveCourseId);
      console.log('Backend URI:', process.env.REACT_APP_BACKEND_URI);
      console.log('Full API URL:', apiUrl);
      console.log('Active course data:', activeCourseData);
      console.log('========================');
      
      const response = await axios.get(apiUrl);
      
      console.log('Modules response:', response);
      console.log('Response data:', response.data);
      console.log('Response status:', response.status);
      
      // Handle the API response format
      if (response.data && response.data.success) {
        const modulesData = response.data.data || [];
        setModules(modulesData);
      } else {
        // Handle other response formats
        let modulesData = response.data;
        
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
        } else if (Array.isArray(response.data)) {
          modulesData = response.data;
        } else {
          modulesData = [];
        }
        
        if (!Array.isArray(modulesData)) {
          modulesData = [];
        }
        
        setModules(modulesData);
      }
      
    } catch (err) {
      console.error('Error fetching modules:', err);
      console.error('Error details:', err.response?.data || err.message);
      console.error('Error status:', err.response?.status);
      console.error('Error URL:', err.config?.url);
      
      // More specific error messages based on status code
      if (err.response?.status === 404) {
        setModulesError('Modules endpoint not found. Please check if the API endpoint is correct.');
      } else if (err.response?.status === 500) {
        setModulesError('Server error. Please try again later.');
      } else if (err.code === 'ECONNREFUSED') {
        setModulesError('Cannot connect to server. Please check if the backend is running.');
      } else {
        setModulesError(`Failed to load modules: ${err.message}`);
      }
      
      // Fallback data for development
      setModules([
        {
          _id: "module1",
          courseId: courseId,
          moduleName: "Introduction to Programming",
          moduleId: "MOD001",
          description: "Basic programming concepts and fundamentals",
          order: 1,
          createdAt: "2024-01-15T00:00:00.000Z"
        },
        {
          _id: "module2",
          courseId: courseId,
          moduleName: "Data Structures",
          moduleId: "MOD002",
          description: "Understanding arrays, linked lists, and basic data structures",
          order: 2,
          createdAt: "2024-01-22T00:00:00.000Z"
        }
      ]);
    } finally {
      setModulesLoading(false);
    }
  };

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URI}/api/courses`);
        
        // Debug: Log the response structure
        console.log('API Response:', response);
        console.log('Response data:', response.data);
        console.log('Response data type:', typeof response.data);
        console.log('Is response.data an array?', Array.isArray(response.data));
        
        // Handle different response formats
        let coursesData = response.data;
        
        // If response.data is not an array, check if it's wrapped in an object
        if (!Array.isArray(coursesData)) {
          // Check if data is nested in a property like 'courses', 'data', etc.
          if (response.data && typeof response.data === 'object') {
            // Try common property names
            if (Array.isArray(response.data.courses)) {
              coursesData = response.data.courses;
            } else if (Array.isArray(response.data.data)) {
              coursesData = response.data.data;
            } else if (Array.isArray(response.data.items)) {
              coursesData = response.data.items;
            } else {
              // If still not an array, convert to array if it's a single object
              coursesData = [response.data];
            }
          } else {
            // If response.data is not an object, create empty array
            coursesData = [];
          }
        }
        
        // Ensure coursesData is an array
        if (!Array.isArray(coursesData)) {
          throw new Error('Invalid response format: expected array of courses');
        }
        
        // Transform API response to match existing structure
        // For now, we'll put all courses in 'current' tab since API only returns courseId and courseName
        const transformedCourses = coursesData.map((course, index) => ({
          id: course.courseId || course.id || index + 1,
          title: course.courseName || course.name || course.title || `Course ${index + 1}`,
          code: course.courseId || course.code || course.id || `CS${index + 1}`,
          semester: course.semester || "Current Semester",
          description: course.description || `Course description for ${course.courseName || course.name || `Course ${index + 1}`}`,
          syllabusUrl: course.SyllabusUrl || course.syllabusUrl || course.syllabus || "https://example.com/syllabus-placeholder.pdf",
          coursePresentations: course.coursePresentations || [],
          courseLectureVideos: course.courseLectureVideos || [],
        }));

        setCourses({
          current: transformedCourses,
          past: [] // Empty for now since API doesn't distinguish between current and past
        });
      } catch (err) {
        console.error('Error fetching courses:', err);
        console.error('Error details:', err.response?.data || err.message);
        setError('Failed to load courses. Please try again later.');
        
        // Fallback to hardcoded data if API fails
        setCourses({
          current: [
            {
              id: 1,
              title: "Introduction to Computer Science",
              code: "CS101",
              semester: "Fall 2023",
              description: "An introductory course covering fundamental concepts in computer science.",
              syllabusUrl: "https://example.com/syllabus/cs101",
              coursePresentations: [], // Course presentations - will be populated from database
              courseLectureVideos: [], // Course lecture videos - will be populated from database
            }
          ],
          past: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Set initial active course when tab changes and fetch modules
  useEffect(() => {
    if (courses.current.length > 0) {
      const newActiveCourse = courses.current[0].id;
      setActiveCourse(newActiveCourse);
      fetchModules(newActiveCourse);
    } else {
      setActiveCourse(null);
      setModules([]);
    }
    setActiveSection('overview');
  }, [activeTab, courses]);

  console.log(activeCourseData);
  const renderOverview = () => (
    <div className="space-y-6">
      {activeCourseData ? (
        <>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{activeCourseData.title}</h3>
            <p className="text-gray-600 mt-2">{activeCourseData.description}</p>
            <div className="mt-4 space-y-2">
              <a
                href={activeCourseData.syllabusUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-crimson-600 hover:text-crimson-700"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View Syllabus
              </a>
            </div>
          </div>

          {/* Modules Section */}
          <div className="mt-8">
            <h4 className="text-xl font-semibold text-gray-900 mb-4">Course Modules</h4>
            
            {/* Modules Loading State */}
            {modulesLoading && (
              <div className="text-center py-4">
                <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-crimson-600 hover:bg-crimson-500 transition ease-in-out duration-150 cursor-not-allowed">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading modules...
                </div>
              </div>
            )}

            {/* Modules Error State */}
            {modulesError && !modulesLoading && (
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
                      <p>{modulesError}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modules List */}
            {!modulesLoading && !modulesError && (
              <div className="space-y-4">
                {modules.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No modules</h3>
                    <p className="mt-1 text-sm text-gray-500">No modules have been created for this course yet.</p>
                  </div>
                ) : (
                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Module
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                          <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {modules
                          .sort((a, b) => {
                            // Sort by order number from smallest to largest
                            const orderA = a.order || 0;
                            const orderB = b.order || 0;
                            return orderA - orderB;
                          })
                          .map((module) => (
                          <tr key={module._id || module.id || Math.random()} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {module.moduleName || module.name || 'Untitled Module'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 max-w-xs truncate">
                                {module.description || 'No description available'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex space-x-2">
                                <Link
                                  to={`/module/${module.moduleId || module.id}/presentations`}
                                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-crimson-600 hover:bg-crimson-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-crimson-500"
                                >
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  Presentations
                                </Link>
                                <Link
                                  to={`/module/${module.moduleId || module.id}/lectures`}
                                  className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-crimson-500"
                                >
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Lectures
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No course selected</p>
        </div>
      )}
    </div>
  );

  return (
    <section id="teaching" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Teaching</h2>

              <div className="space-y-8">
                {/* Loading State */}
                {loading && (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-crimson-600 hover:bg-crimson-500 transition ease-in-out duration-150 cursor-not-allowed">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading courses...
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
                          <h3 className="text-sm font-medium text-red-800">Error loading courses</h3>
                          <div className="mt-2 text-sm text-red-700">
                            <p>{error}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Course Type Tabs */}
                {!loading && !error && (
                  <>
                    <div className="flex justify-center space-x-4 border-b border-gray-200">
                      <span className="px-4 py-2 text-sm font-medium border-b-2 border-crimson-600 text-crimson-600">
                        Courses
                      </span>
                    </div>

                    {/* Course Selection */}
                    <div className="flex flex-wrap gap-4 justify-center">
                      {courses.current.map((course) => (
                        <button
                          key={course.id}
                          onClick={() => {
                            setActiveCourse(course.id);
                            fetchModules(course.id);
                            setActiveSection('overview');
                          }}
                          className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                            activeCourse === course.id
                              ? 'bg-crimson-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {course.code}
                        </button>
                      ))}
                    </div>

                    {activeCourseData && (
                      <>
                        {/* Course Navigation */}
                        <div className="flex justify-center space-x-4 border-b border-gray-200">
                          <button
                            onClick={() => setActiveSection('overview')}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                              activeSection === 'overview'
                                ? 'border-crimson-600 text-crimson-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            Overview
                          </button>
                        </div>

                        {/* Course Content */}
                        <div className="mt-8">
                          {activeSection === 'overview' && renderOverview()}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Teaching; 
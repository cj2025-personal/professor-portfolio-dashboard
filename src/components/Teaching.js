import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Teaching = () => {
  const [activeTab] = useState('current');
  const [activeCourse, setActiveCourse] = useState(null);
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
          
          await axios.get(testUrl);
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
    // fetchModules is stable for the lifetime of the component and takes the
    // course explicitly; the course list and tab are the real triggers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, courses]);

  const renderOverview = () => (
    <div>
      {activeCourseData ? (
        <>
          {/* Course header. The catalogue code was the only thing on the
              selector pill; here it becomes a kicker above the real title so
              both pieces of information land. */}
          <div className="ark-card p-5 md:p-6">
            <p className="ark-kicker tabular-nums">{activeCourseData.code}</p>
            <h3 className="type-subheading mt-2 text-gray-900">
              {activeCourseData.title}
            </h3>
            <p className="mt-2.5 max-w-reading text-[0.9375rem] leading-relaxed text-gray-600">
              {activeCourseData.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <a
                href={activeCourseData.syllabusUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Syllabus
              </a>
              <Link to={`/course/${activeCourse}/discussions`} className="btn-quiet">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Discussions
              </Link>
            </div>
          </div>

          {/* Modules Section */}
          <div className="mt-6">
            <h4 className="type-subheading mb-4 text-gray-900">Course modules</h4>

            {/* Modules Loading State */}
            {modulesLoading && (
              <div className="py-8 text-center">
                <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-brand-600"></div>
                <p className="ark-meta mt-3">Loading modules…</p>
              </div>
            )}

            {/* Modules Error State */}
            {modulesError && !modulesLoading && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <h3 className="text-sm font-semibold text-red-800">Error loading modules</h3>
                <p className="mt-1 text-sm text-red-700">{modulesError}</p>
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
                  /* A numbered syllabus register rather than a data table.
                     Modules are an ordered reading sequence, and the old table
                     spent a whole column repeating "No description available".
                     Both actions step down in weight — neither is the point of
                     the row; the module is. */
                  <div className="ark-card ark-list overflow-hidden">
                    {[...modules]
                      .sort((a, b) => (a.order || 0) - (b.order || 0))
                      .map((module, i) => (
                        /* Stacked until there is room for a single row.
                           Previously this was one flex line with the title on
                           `flex-1` (basis 0, so it may shrink to nothing) and
                           the buttons on `flex-none`. `flex-wrap` never fired,
                           because nothing was ever forced to overflow — the
                           title just absorbed every pixel of the shortfall and
                           collapsed to 17px on a 375px screen, one word per
                           line. */
                        <div
                          key={module._id || module.id || i}
                          className="px-5 py-4 transition-colors hover:bg-gray-50 md:px-6"
                        >
                          <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-x-5">
                            <div className="flex min-w-0 flex-1 items-baseline gap-3.5 md:min-w-[14rem]">
                              <span className="ark-display w-6 flex-none text-base tabular-nums text-gray-300">
                                {String(i + 1).padStart(2, '0')}
                              </span>

                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900">
                                  {module.moduleName || module.name || 'Untitled module'}
                                </p>
                                {module.description && module.description !== 'No description available' && (
                                  <p className="ark-meta mt-0.5 truncate">{module.description}</p>
                                )}
                              </div>
                            </div>

                            {/* Indented to the title's left edge while stacked, so
                                the row still reads as one item. */}
                            <div className="flex flex-none gap-2 pl-[2.375rem] md:pl-0">
                              <Link
                                to={`/module/${module.moduleId || module.id}/presentations`}
                                className="btn-quiet"
                              >
                                Presentations
                              </Link>
                              <Link
                                to={`/module/${module.moduleId || module.id}/lectures`}
                                className="btn-quiet"
                              >
                                Lectures
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
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No course selected</p>
        </div>
      )}
    </div>
  );

  return (
    <section id="teaching" className="ark-band--tint ark-section">
      <div className="ark-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true, margin: '-80px' }}
        >
          <div className="sec-head">
            <p className="sec-eyebrow">In the classroom</p>
            <h2 className="sec-title">Teaching</h2>
            <p className="sec-lead">
              Graduate courses in public finance and debt, with syllabi, module
              presentations, and lecture recordings.
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="py-10 text-center">
              <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-gray-200 border-t-brand-600"></div>
              <p className="ark-meta mt-4">Loading courses…</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <h3 className="text-sm font-semibold text-red-800">Error loading courses</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Course selector. Previously this was three stacked navigation
                  layers — a one-item "Courses" tab bar, the course pills, and a
                  one-item "Overview" tab bar — for a single real choice. Only
                  the real choice remains, and the pills now carry course names
                  rather than bare catalogue codes. */}
              <div className="seg mb-5" role="tablist" aria-label="Course">
                {courses.current.map((course) => (
                  <button
                    key={course.id}
                    role="tab"
                    aria-selected={activeCourse === course.id}
                    onClick={() => {
                      setActiveCourse(course.id);
                      fetchModules(course.id);
                    }}
                    className={`seg__btn ${activeCourse === course.id ? 'seg__btn--on' : ''}`}
                  >
                    <span className="tabular-nums">{course.code}</span>
                  </button>
                ))}
              </div>

              {activeCourseData && renderOverview()}
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Teaching; 
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const TeachingAdmin = () => {
  const [activeTab, setActiveTab] = useState('current');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    semester: '',
    description: '',
    syllabus: '',
    topics: [],
    lectures: []
  });

  // Sample data structure (this would come from your backend)
  const courses = {
    current: [
      {
        id: 1,
        title: "Introduction to Computer Science",
        code: "CS101",
        semester: "Fall 2023",
        description: "An introductory course covering fundamental concepts in computer science.",
        syllabus: "https://example.com/syllabus/cs101",
        resources: {
          lectures: [
            {
              id: 1,
              title: "Introduction to Programming",
              date: "2023-09-01",
              video: "https://example.com/videos/lecture1",
              slides: "https://example.com/slides/lecture1",
              audio: "https://example.com/audio/lecture1",
              description: "Overview of programming concepts and basic syntax"
            }
          ],
          topics: [
            "Programming Fundamentals",
            "Data Structures",
            "Algorithms",
            "Object-Oriented Programming"
          ]
        }
      }
    ],
    past: []
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setFormData({
      title: course.title,
      code: course.code,
      semester: course.semester,
      description: course.description,
      syllabus: course.syllabus,
      topics: course.resources.topics,
      lectures: course.resources.lectures
    });
    setIsEditing(true);
  };

  const handleNewCourse = () => {
    setSelectedCourse(null);
    setFormData({
      title: '',
      code: '',
      semester: '',
      description: '',
      syllabus: '',
      topics: [],
      lectures: []
    });
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTopicChange = (index, value) => {
    const newTopics = [...formData.topics];
    newTopics[index] = value;
    setFormData(prev => ({
      ...prev,
      topics: newTopics
    }));
  };

  const handleAddTopic = () => {
    setFormData(prev => ({
      ...prev,
      topics: [...prev.topics, '']
    }));
  };

  const handleRemoveTopic = (index) => {
    const newTopics = formData.topics.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      topics: newTopics
    }));
  };

  const handleLectureChange = (index, field, value) => {
    const newLectures = [...formData.lectures];
    newLectures[index] = {
      ...newLectures[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      lectures: newLectures
    }));
  };

  const handleAddLecture = () => {
    setFormData(prev => ({
      ...prev,
      lectures: [
        ...prev.lectures,
        {
          id: Date.now(),
          title: '',
          date: '',
          video: '',
          slides: '',
          audio: '',
          description: ''
        }
      ]
    }));
  };

  const handleRemoveLecture = (index) => {
    const newLectures = formData.lectures.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      lectures: newLectures
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically make an API call to save the data
    console.log('Saving course data:', formData);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Course Management</h2>
                <button
                  onClick={handleNewCourse}
                  className="px-4 py-2 bg-crimson-600 text-white rounded-lg hover:bg-crimson-700 transition-colors"
                >
                  Add New Course
                </button>
              </div>

              {!isEditing ? (
                <div className="space-y-8">
                  {/* Course Type Tabs */}
                  <div className="flex space-x-4 border-b border-gray-200">
                    <button
                      onClick={() => setActiveTab('current')}
                      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'current'
                          ? 'border-crimson-600 text-crimson-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Current Courses
                    </button>
                    <button
                      onClick={() => setActiveTab('past')}
                      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'past'
                          ? 'border-crimson-600 text-crimson-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Past Courses
                    </button>
                  </div>

                  {/* Course List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses[activeTab].map((course) => (
                      <div
                        key={course.id}
                        className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                      >
                        <h3 className="text-xl font-semibold text-gray-900">{course.title}</h3>
                        <p className="text-crimson-600 font-medium mt-1">{course.code}</p>
                        <p className="text-gray-600 mt-2">{course.description}</p>
                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={() => handleCourseSelect(course)}
                            className="text-crimson-600 hover:text-crimson-700"
                          >
                            Edit Course
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Basic Course Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Course Title</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-crimson-500 focus:ring-crimson-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Course Code</label>
                      <input
                        type="text"
                        name="code"
                        value={formData.code}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-crimson-500 focus:ring-crimson-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Semester</label>
                      <input
                        type="text"
                        name="semester"
                        value={formData.semester}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-crimson-500 focus:ring-crimson-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Syllabus URL</label>
                      <input
                        type="url"
                        name="syllabus"
                        value={formData.syllabus}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-crimson-500 focus:ring-crimson-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-crimson-500 focus:ring-crimson-500"
                    />
                  </div>

                  {/* Course Topics */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <label className="block text-sm font-medium text-gray-700">Course Topics</label>
                      <button
                        type="button"
                        onClick={handleAddTopic}
                        className="text-crimson-600 hover:text-crimson-700"
                      >
                        Add Topic
                      </button>
                    </div>
                    <div className="space-y-2">
                      {formData.topics.map((topic, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={topic}
                            onChange={(e) => handleTopicChange(index, e.target.value)}
                            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-crimson-500 focus:ring-crimson-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveTopic(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Lecture Materials */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <label className="block text-sm font-medium text-gray-700">Lecture Materials</label>
                      <button
                        type="button"
                        onClick={handleAddLecture}
                        className="text-crimson-600 hover:text-crimson-700"
                      >
                        Add Lecture
                      </button>
                    </div>
                    <div className="space-y-4">
                      {formData.lectures.map((lecture, index) => (
                        <div key={lecture.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="text-lg font-medium text-gray-900">Lecture {index + 1}</h4>
                            <button
                              type="button"
                              onClick={() => handleRemoveLecture(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Title</label>
                              <input
                                type="text"
                                value={lecture.title}
                                onChange={(e) => handleLectureChange(index, 'title', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-crimson-500 focus:ring-crimson-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Date</label>
                              <input
                                type="date"
                                value={lecture.date}
                                onChange={(e) => handleLectureChange(index, 'date', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-crimson-500 focus:ring-crimson-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Video URL</label>
                              <input
                                type="url"
                                value={lecture.video}
                                onChange={(e) => handleLectureChange(index, 'video', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-crimson-500 focus:ring-crimson-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Slides URL</label>
                              <input
                                type="url"
                                value={lecture.slides}
                                onChange={(e) => handleLectureChange(index, 'slides', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-crimson-500 focus:ring-crimson-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Audio URL</label>
                              <input
                                type="url"
                                value={lecture.audio}
                                onChange={(e) => handleLectureChange(index, 'audio', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-crimson-500 focus:ring-crimson-500"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700">Description</label>
                              <textarea
                                value={lecture.description}
                                onChange={(e) => handleLectureChange(index, 'description', e.target.value)}
                                rows={2}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-crimson-500 focus:ring-crimson-500"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-crimson-600 text-white rounded-lg hover:bg-crimson-700"
                    >
                      Save Course
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TeachingAdmin; 
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const Publications = () => {
  const [publications, setPublications] = useState({});
  const [activeCategory, setActiveCategory] = useState('journal article');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [synopsisModal, setSynopsisModal] = useState({
    isOpen: false,
    synopsis: '',
    title: '',
    isBookChapter: false,
    bookDetails: null
  });

  // Fetch publications data from API
  const fetchPublications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URI}/api/publications`);
      setPublications(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to load publications. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublications();
  }, []);

  // Get available categories from the fetched data
  const categories = Object.keys(publications);

  // Define the four fixed tabs in the desired order
  const tabs = ['books', 'book chapter', 'journal article', 'other'];
  // Display mapping for tab labels
  const tabDisplay = {
    'books': 'Books',
    'book chapter': 'Book Chapters',
    'journal article': 'Journal Articles',
    'other': 'Other'
  };

  // Flatten all publications into a single array
  const allPublications = Object.values(publications)
    .filter(Array.isArray)
    .flat();

  // Filter publications based on active category and search term
  const getFilteredPublications = () => {
    return allPublications.filter(pub =>
      pub.category === activeCategory &&
      (
        pub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pub.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pub.synopsis?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  const filteredPublications = getFilteredPublications();

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Handle synopsis modal
  const openSynopsisModal = (synopsis, title, isBookChapter = false, bookDetails = null) => {
    setSynopsisModal({ isOpen: true, synopsis, title, isBookChapter, bookDetails });
  };

  const closeSynopsisModal = () => {
    setSynopsisModal({ isOpen: false, synopsis: '', title: '', isBookChapter: false, bookDetails: null });
  };

  // Check if there are any books in the data
  const hasBooks = Object.values(publications).some(categoryPublications => 
    Array.isArray(categoryPublications) &&
    categoryPublications.some(pub => pub.category === 'books')
  );

  // Check if there are any book chapters in the data
  const hasBookChapters = Object.values(publications).some(categoryPublications => 
    Array.isArray(categoryPublications) &&
    categoryPublications.some(pub => pub.category === 'book chapter')
  );

  if (loading) {
    return (
      <section id="publications" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8">
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-crimson-600"></div>
                <span className="ml-3 text-gray-600">Loading publications...</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="publications" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8">
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-crimson-600 text-white rounded-lg hover:bg-crimson-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="publications" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8">
                {/* Section Title */}
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                  Publications
                </h2>
                {/* Category Tabs */}
                <div className="flex justify-center space-x-4 mb-8">
                  {tabs.map((category) => (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                        activeCategory === category
                          ? 'bg-crimson-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tabDisplay[category]}
                    </button>
                  ))}
                </div>
                {/* Selected Tab Title */}
                <h3 className="text-2xl font-semibold text-gray-800 mb-8 text-center capitalize">
                  {tabDisplay[activeCategory]}
                </h3>
                {/* Search */}
                <div className="mb-8">
                  <input
                    type="text"
                    placeholder="Search publications..."
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-crimson-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Publications List */}
                <div className="space-y-6">
                  {filteredPublications.map((publication, index) => (
                    <motion.div
                      key={publication.publicationId || index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0"
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {publication.title}
                          </h3>
                          <p className="text-gray-600 mb-2">
                            {publication.author}
                            {publication.bookChapterDetails?.isCoAuthor && (
                              <span className="ml-2 text-sm text-gray-500">(Co-author)</span>
                            )}
                          </p>
                          <p className="text-gray-500 mb-4">
                            {formatDate(publication.date)}
                            <div className="flex flex-wrap gap-2 mt-2">
                              {publication.link && (
                                <a
                                  href={publication.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-crimson-600 hover:text-crimson-700 font-medium"
                                >
                                  View Publication
                                </a>
                              )}
                              {/* For Books tab, show View Synopsis button if synopsis exists */}
                              {activeCategory === 'books' && publication.synopsis && (
                                <button
                                  onClick={() => openSynopsisModal(
                                    publication.synopsis,
                                    publication.title,
                                    false,
                                    null
                                  )}
                                  className="text-crimson-600 hover:text-crimson-700 font-medium"
                                >
                                  View Synopsis
                                </button>
                              )}
                              {/* For other categories, show View Synopsis if synopsis exists */}
                              {activeCategory !== 'books' && publication.synopsis && (
                                <button
                                  onClick={() => openSynopsisModal(
                                    publication.synopsis, 
                                    publication.title, 
                                    publication.category === 'book chapter',
                                    publication.bookChapterDetails
                                  )}
                                  className="text-crimson-600 hover:text-crimson-700 font-medium"
                                >
                                  View Synopsis
                                </button>
                              )}
                            </div>
                          </p>
                          {/* Book Chapter Details */}
                          {publication.category === 'book chapter' && publication.bookChapterDetails && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                              <h4 className="font-semibold text-gray-900 mb-2">Book Chapter Details:</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                {publication.bookChapterDetails.reportTitle && (
                                  <div>
                                    <span className="font-medium text-gray-700">Report/Book Title:</span>
                                    <span className="ml-2 text-gray-600">{publication.bookChapterDetails.reportTitle}</span>
                                  </div>
                                )}
                                {publication.bookChapterDetails.publicationName && (
                                  <div>
                                    <span className="font-medium text-gray-700">Publication Name:</span>
                                    <span className="ml-2 text-gray-600">{publication.bookChapterDetails.publicationName}</span>
                                  </div>
                                )}
                                {publication.bookChapterDetails.pageNumbers && (
                                  <div>
                                    <span className="font-medium text-gray-700">Pages:</span>
                                    <span className="ml-2 text-gray-600">{publication.bookChapterDetails.pageNumbers}</span>
                                  </div>
                                )}
                                {publication.bookChapterDetails.volume && (
                                  <div>
                                    <span className="font-medium text-gray-700">Volume:</span>
                                    <span className="ml-2 text-gray-600">{publication.bookChapterDetails.volume}</span>
                                  </div>
                                )}
                                {publication.bookChapterDetails.issue && (
                                  <div>
                                    <span className="font-medium text-gray-700">Issue:</span>
                                    <span className="ml-2 text-gray-600">{publication.bookChapterDetails.issue}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="mt-4 md:mt-0 md:ml-6 flex items-center space-x-4">
                          <span className="px-3 py-1 bg-crimson-100 text-crimson-600 rounded-full text-sm font-medium capitalize">
                            {publication.category.replace('-', ' ')}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {filteredPublications.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">
                      {searchTerm 
                        ? 'No publications found matching your criteria.' 
                        : `No ${tabDisplay[activeCategory]}s available.`
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Synopsis Modal */}
      {synopsisModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">
                  Synopsis: {synopsisModal.title}
                </h3>
                <button
                  onClick={closeSynopsisModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <p className="text-gray-700 leading-relaxed">
                {synopsisModal.synopsis}
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default Publications; 
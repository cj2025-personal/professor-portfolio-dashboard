import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const Publications = () => {
  const [publications, setPublications] = useState({});
  const [activeCategory, setActiveCategory] = useState('books');
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

  const [imageModal, setImageModal] = useState({
    isOpen: false,
    imageUrl: '',
    title: '',
    publicationLink: ''
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

  // Handle image modal
  const openImageModal = (imageUrl, title, publicationLink = '') => {
    setImageModal({ isOpen: true, imageUrl, title, publicationLink });
  };

  const closeImageModal = () => {
    setImageModal({ isOpen: false, imageUrl: '', title: '', publicationLink: '' });
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
      <section id="publications" className="py-20 bg-gray-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-20 left-20 w-24 h-24 border border-crimson-800 transform rotate-12"></div>
          <div className="absolute bottom-20 right-20 w-20 h-20 border border-crimson-800 rounded-full"></div>
          <div className="absolute top-1/3 right-1/4 w-16 h-16 border border-crimson-800 transform rotate-45"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8">
                {/* Section Title */}
                <div className="text-center mb-8 relative">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-crimson-100 rounded-full mb-4">
                    <svg className="w-8 h-8 text-crimson-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  {/* Themed Illustration: Open journal and magnifying glass */}
                  <div className="absolute top-0 left-0 hidden md:block z-0 opacity-80 pointer-events-none">
                    <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="10" y="50" width="100" height="20" rx="6" fill="#fee2e2"/>
                      <rect x="30" y="40" width="60" height="10" rx="3" fill="#fca5a5"/>
                      <rect x="50" y="20" width="20" height="20" rx="6" fill="#991b1b"/>
                      <circle cx="90" cy="30" r="10" fill="#b91c1c"/>
                      <rect x="95" y="35" width="15" height="5" rx="2" fill="#fca5a5"/>
                      <rect x="60" y="60" width="40" height="6" rx="2" fill="#fff"/>
                    </svg>
                  </div>
                  {/* End Illustration */}
                  <h2 className="text-3xl font-bold text-gray-900">Publications</h2>
                  <p className="text-gray-600 mt-2">Explore my research contributions and academic work</p>
                </div>
                
                {/* Category Tabs */}
                <div className="flex justify-center space-x-4 mb-8">
                  {tabs.map((category) => (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                        activeCategory === category
                          ? 'bg-crimson-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        {category === 'books' && (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        )}
                        {category === 'book chapter' && (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        )}
                        {category === 'journal article' && (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                          </svg>
                        )}
                        {category === 'other' && (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        )}
                        <span className="capitalize">{tabDisplay[category]}</span>
                      </div>
                    </button>
                  ))}
                </div>
                
                {/* Selected Tab Title */}
                <h3 className="text-2xl font-semibold text-gray-800 mb-8 text-center capitalize">
                  {tabDisplay[activeCategory]}
                </h3>
                
                {/* Search */}
                <div className="mb-8">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search publications..."
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-crimson-500 focus:border-transparent transition-all duration-200"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
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
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {publication.title}
                          </h3>
                          <p className="text-gray-600 mb-2">
                            {publication.author}
                            {/* Show (Co-author) if isCoAuthor is true in journalArticleDetails */}
                            {publication.category === 'journal article' && publication.journalArticleDetails?.isCoAuthor && (
                              <span className="ml-2 text-sm text-gray-500">(Co-author)</span>
                            )}
                          </p>
                          {/* Journal Article Details */}
                          {publication.category === 'journal article' && publication.journalArticleDetails && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                              <h4 className="font-semibold text-gray-900 mb-2">Journal Article Details:</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                {publication.journalArticleDetails.articleTitle && (
                                  <div>
                                    <span className="font-medium text-gray-700">Article Title:</span>
                                    <span className="ml-2 text-gray-600">{publication.journalArticleDetails.articleTitle}</span>
                                  </div>
                                )}
                                {publication.journalArticleDetails.journalName && (
                                  <div>
                                    <span className="font-medium text-gray-700">Journal Name:</span>
                                    <span className="ml-2 text-gray-600">{publication.journalArticleDetails.journalName}</span>
                                  </div>
                                )}
                                {publication.journalArticleDetails.volume && (
                                  <div>
                                    <span className="font-medium text-gray-700">Volume:</span>
                                    <span className="ml-2 text-gray-600">{publication.journalArticleDetails.volume}</span>
                                  </div>
                                )}
                                {publication.journalArticleDetails.issue && (
                                  <div>
                                    <span className="font-medium text-gray-700">Issue:</span>
                                    <span className="ml-2 text-gray-600">{publication.journalArticleDetails.issue}</span>
                                  </div>
                                )}
                                {publication.journalArticleDetails.pageNumbers && (
                                  <div>
                                    <span className="font-medium text-gray-700">Pages:</span>
                                    <span className="ml-2 text-gray-600">{publication.journalArticleDetails.pageNumbers}</span>
                                  </div>
                                )}
                                {publication.journalArticleDetails.publicationDate && (
                                  <div>
                                    <span className="font-medium text-gray-700">Publication Date:</span>
                                    <span className="ml-2 text-gray-600">{publication.journalArticleDetails.publicationDate}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          {/* Publication Link and Synopsis */}
                          <div className="flex flex-wrap gap-2 mt-2">
                            {publication.link && (
                              <a
                                href={publication.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-crimson-600 hover:text-crimson-700 font-medium"
                              >
                                {publication.category === 'journal article' ? 'View Publication / DOI link' : 'View Publication'}
                              </a>
                            )}
                            {publication.synopsis && (
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
                          {/* Book Chapter Details (unchanged) */}
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
                          {/* Book Image for Books */}
                          {publication.category === 'books' && publication.bookImage && (
                            <img 
                              src={publication.bookImage} 
                              alt={`Cover of ${publication.title}`}
                              className="w-32 h-40 object-cover rounded-lg shadow-md border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow duration-200"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                              onClick={() => openImageModal(publication.bookImage, publication.title, publication.link)}
                            />
                          )}
                          {/* Category label - hide for books */}
                          {publication.category !== 'books' && (
                            <span className="px-3 py-1 bg-crimson-100 text-crimson-600 rounded-full text-sm font-medium capitalize">
                              {publication.category.replace('-', ' ')}
                            </span>
                          )}
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

      {/* Image Modal */}
      {imageModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative max-w-4xl max-h-[90vh] overflow-hidden"
          >
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 z-10 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all duration-200 shadow-lg"
            >
              <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 text-center">
                  {imageModal.title}
                </h3>
              </div>
              <div className="p-4">
                <img 
                  src={imageModal.imageUrl} 
                  alt={imageModal.title}
                  className={`max-w-full max-h-[85vh] object-contain mx-auto ${imageModal.publicationLink ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                  onClick={() => {
                    if (imageModal.publicationLink) {
                      window.open(imageModal.publicationLink, '_blank');
                    }
                  }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default Publications; 
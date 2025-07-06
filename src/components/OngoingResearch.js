import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const OngoingResearch = () => {
  const [ongoingResearch, setOngoingResearch] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [referencesModal, setReferencesModal] = useState({
    isOpen: false,
    references: [],
    title: ''
  });

  // Fetch ongoing research
  const fetchOngoingResearch = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URI}/api/ongoing-research`);
      let data = response.data.data;
      if (!Array.isArray(data)) data = [];
      setOngoingResearch(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOngoingResearch();
  }, []);

  const openReferencesModal = (references, title) => {
    setReferencesModal({
      isOpen: true,
      references,
      title
    });
  };

  const closeReferencesModal = () => {
    setReferencesModal({
      isOpen: false,
      references: [],
      title: ''
    });
  };

  const handlePresentationClick = (presentationUrl) => {
    if (presentationUrl) {
      window.open(presentationUrl, '_blank');
    }
  };

  const handleResearchPaperClick = (researchPaperUrl) => {
    const url = researchPaperUrl || 'https://example.com/research-paper';
    window.open(url, '_blank');
  };

  return (
    <>
      <section id="ongoing-research" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Ongoing Research
            </h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-crimson-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading ongoing research...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600">Error: {error}</p>
                <button 
                  onClick={fetchOngoingResearch}
                  className="mt-4 px-4 py-2 bg-crimson-600 text-white rounded-lg hover:bg-crimson-700"
                >
                  Retry
                </button>
              </div>
            ) : ongoingResearch.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No ongoing research projects available.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {ongoingResearch.map((research, index) => (
                  <motion.div
                    key={research.researchId}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-crimson-50 rounded-xl shadow-sm border border-crimson-100 overflow-hidden"
                  >
                    <div className="p-8">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {research.title}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                          research.status === 'active' 
                            ? 'bg-green-100 text-green-800'
                            : research.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {research.status}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 mt-6">
                        <button
                          onClick={() => handlePresentationClick(research.presentation?.fileUrl)}
                          className="px-4 py-2 bg-crimson-600 text-white rounded-lg hover:bg-crimson-700 font-medium transition-colors"
                        >
                          Presentation
                        </button>
                        <button
                          onClick={() => handleResearchPaperClick(research.researchPaper?.fileUrl)}
                          className="px-4 py-2 bg-gray-200 text-crimson-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                        >
                          Research Paper
                        </button>
                        <button
                          onClick={() => openReferencesModal(research.references, research.title)}
                          className="px-4 py-2 bg-gray-200 text-crimson-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                        >
                          References
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* References Modal */}
      {referencesModal.isOpen && (
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
                  References: {referencesModal.title}
                </h3>
                <button
                  onClick={closeReferencesModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {referencesModal.references.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No references available for this research project.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {referencesModal.references.map((reference, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-crimson-600 font-semibold text-sm">
                          {index + 1}.
                        </span>
                        <p className="text-gray-700 leading-relaxed">
                          {reference.reference}
                        </p>
                      </div>
                      {reference.addedAt && (
                        <p className="text-xs text-gray-500 mt-2 ml-6">
                          Added: {new Date(reference.addedAt).toLocaleDateString()}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default OngoingResearch; 
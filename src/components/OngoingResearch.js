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
      <section id="ongoing-research" className="ark-band--tint ark-section">
        <div className="ark-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true, margin: '-80px' }}
          >
            <div className="sec-head">
              <p className="sec-eyebrow">In progress</p>
              <h2 className="sec-title">Ongoing research</h2>
              <p className="sec-lead">
                Current projects, with the presentation, working paper, and supporting
                references for each.
              </p>
            </div>

            {loading ? (
              <div className="py-10 text-center">
                <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-gray-200 border-t-brand-600"></div>
                <p className="ark-meta mt-4">Loading ongoing research…</p>
              </div>
            ) : error ? (
              <div className="py-10 text-center">
                <p className="text-sm text-red-600">Error: {error}</p>
                <button onClick={fetchOngoingResearch} className="btn-secondary mt-4">
                  Retry
                </button>
              </div>
            ) : ongoingResearch.length === 0 ? (
              <p className="ark-meta py-10 text-center">No ongoing research projects available.</p>
            ) : (
              /* A hairline-separated register rather than a stack of cards
                 each wearing a heavy navy left rule. The index numbers give
                 the list a spine and let the eye count the work. */
              <div className="ark-card ark-list overflow-hidden">
                {ongoingResearch.map((research, index) => (
                  <motion.article
                    key={research.researchId}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: Math.min(index, 4) * 0.07 }}
                    viewport={{ once: true }}
                    className="group flex gap-5 p-5 transition-colors hover:bg-gray-50 md:gap-6 md:p-5"
                  >
                    <span className="ark-display hidden pt-0.5 text-lg tabular-nums text-gray-300 sm:block">
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
                        <h3 className="type-card-title max-w-3xl text-gray-900 transition-colors group-hover:text-brand-600">
                          {research.title}
                        </h3>
                        <span
                          className={`ark-chip ${research.status === 'active' ? 'ark-chip--active' : ''}`}
                        >
                          {research.status}
                        </span>
                      </div>

                      {/* One primary action per row; the two supporting
                          documents step down to quiet buttons so the reader
                          is not offered three equally-loud choices. */}
                      <div className="mt-3 flex flex-wrap gap-2.5">
                        <button
                          onClick={() => handlePresentationClick(research.presentation?.fileUrl)}
                          className="btn-primary"
                        >
                          Presentation
                        </button>
                        <button
                          onClick={() => handleResearchPaperClick(research.researchPaper?.fileUrl)}
                          className="btn-quiet"
                        >
                          Working paper
                        </button>
                        <button
                          onClick={() => openReferencesModal(research.references, research.title)}
                          className="btn-quiet"
                        >
                          References
                          {research.references?.length > 0 && (
                            <span className="tabular-nums opacity-60">{research.references.length}</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.article>
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
                <h3 className="type-dialog-title text-gray-900">
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
                        <span className="text-brand-600 font-semibold text-sm">
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
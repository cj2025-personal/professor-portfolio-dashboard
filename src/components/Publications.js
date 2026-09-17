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

  // Counts sit on the tabs so the reader can see the shape of the record
  // before clicking. Unfiltered by search — a tab's size is a fact about
  // the bibliography, not about the current query.
  const countFor = (category) => allPublications.filter((pub) => pub.category === category).length;

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

  if (loading) {
    return (
      <section id="publications" className="ark-band ark-section">
        <div className="ark-container">
          <div className="flex items-center justify-center py-12">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-gray-200 border-t-brand-600"></div>
            <span className="ark-meta ml-3">Loading publications…</span>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="publications" className="ark-band ark-section">
        <div className="ark-container">
          <div className="py-12 text-center">
            <p className="mb-4 text-sm text-red-600">{error}</p>
            <button onClick={() => window.location.reload()} className="btn-secondary">
              Try again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="publications" className="ark-band ark-section">
        <div className="ark-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true, margin: '-80px' }}
          >
            <div className="sec-head">
              <p className="sec-eyebrow">Bibliography</p>
              <h2 className="sec-title">Publications</h2>
              <p className="sec-lead">
                Books, chapters, and peer-reviewed articles across public finance,
                municipal securities, and development finance.
              </p>
            </div>

            {/* Filter bar. The four categories carried four near-identical
                document icons that distinguished nothing; counts do the job
                the icons were pretending to. The redundant heading that
                repeated the active tab below it is gone. */}
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="seg" role="tablist" aria-label="Publication category">
                {tabs.map((category) => (
                  <button
                    key={category}
                    role="tab"
                    aria-selected={activeCategory === category}
                    onClick={() => setActiveCategory(category)}
                    className={`seg__btn ${activeCategory === category ? 'seg__btn--on' : ''}`}
                  >
                    {tabDisplay[category]}
                    <span className="seg__count">{countFor(category)}</span>
                  </button>
                ))}
              </div>

              <div className="relative lg:w-72">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="search"
                  aria-label="Search publications"
                  placeholder="Search publications…"
                  className="ark-field pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Publications register */}
            <div className="ark-card ark-list overflow-hidden">
              {filteredPublications.map((publication, index) => {
                const journal = publication.category === 'journal article' ? publication.journalArticleDetails : null;
                const chapter = publication.category === 'book chapter' ? publication.bookChapterDetails : null;

                /* Bibliographic detail belongs on one citation line, not in a
                   six-cell grid of "Label: value" pairs inside a grey box. */
                const citation = [
                  journal?.journalName || chapter?.publicationName || chapter?.reportTitle,
                  (journal?.volume || chapter?.volume) && `Vol. ${journal?.volume || chapter?.volume}`,
                  (journal?.issue || chapter?.issue) && `No. ${journal?.issue || chapter?.issue}`,
                  (journal?.pageNumbers || chapter?.pageNumbers) && `pp. ${journal?.pageNumbers || chapter?.pageNumbers}`,
                  journal?.publicationDate,
                ]
                  .filter(Boolean)
                  .join(' · ');

                return (
                  <motion.article
                    key={publication.publicationId || index}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: Math.min(index, 5) * 0.05 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-5 p-5 transition-colors hover:bg-gray-50 md:gap-6 md:p-5"
                  >
                    {publication.category === 'books' && publication.bookImage && (
                      <button
                        type="button"
                        onClick={() => openImageModal(publication.bookImage, publication.title, publication.link)}
                        className="hidden flex-none sm:block"
                        aria-label={`Enlarge cover of ${publication.title}`}
                      >
                        <img
                          src={publication.bookImage}
                          alt=""
                          className="h-24 w-[4.5rem] rounded-lg border border-gray-200 object-cover shadow-sm transition-shadow duration-200 hover:shadow-md"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </button>
                    )}

                    <div className="min-w-0 flex-1">
                      <h3 className="type-card-title text-gray-900">
                        {publication.title}
                      </h3>

                      <p className="mt-1.5 text-sm text-gray-600">
                        {publication.author}
                        {journal?.isCoAuthor && <span className="ml-2 text-gray-500">(Co-author)</span>}
                      </p>

                      {journal?.articleTitle && journal.articleTitle !== publication.title && (
                        <p className="ark-meta mt-1 italic">{journal.articleTitle}</p>
                      )}

                      {citation && <p className="ark-meta mt-1.5">{citation}</p>}

                      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                        {publication.link && (
                          <a
                            href={publication.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link-cta"
                          >
                            {publication.category === 'journal article' ? 'DOI link' : 'View publication'}
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                        {publication.synopsis && (
                          <button
                            onClick={() =>
                              openSynopsisModal(
                                publication.synopsis,
                                publication.title,
                                publication.category === 'book chapter',
                                publication.bookChapterDetails
                              )
                            }
                            className="text-sm font-semibold text-gray-500 transition-colors hover:text-brand-600"
                          >
                            Synopsis
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.article>
                );
              })}

              {filteredPublications.length === 0 && (
                <p className="ark-meta py-14 text-center">
                  {searchTerm
                    ? 'No publications match that search.'
                    : `No ${tabDisplay[activeCategory].toLowerCase()} recorded yet.`}
                </p>
              )}
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
            className="ark-stripe max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-xl"
          >
            <div className="border-b border-gray-100 p-6">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="ark-kicker">Synopsis</p>
                  <h3 className="type-dialog-title mt-1 text-gray-900">{synopsisModal.title}</h3>
                </div>
                <button
                  onClick={closeSynopsisModal}
                  aria-label="Close synopsis"
                  className="flex-none text-gray-400 transition-colors hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-6">
              <p className="max-w-reading text-[0.9375rem] leading-[1.75] text-gray-700">
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
                <h3 className="type-dialog-title text-gray-900 text-center">
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
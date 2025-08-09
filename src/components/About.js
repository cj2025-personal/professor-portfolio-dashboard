import React from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const About = () => {
  const handleDownloadVitae = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URI}/api/cv/url`);
      const data = response?.data?.data ?? response?.data ?? {};
      const fileUrl = data.fileUrl || data.url || data.cvUrl;
      if (!fileUrl) {
        throw new Error('CV URL not found in response');
      }

      // Attempt a programmatic download; fallback to opening in a new tab
      const anchor = document.createElement('a');
      anchor.href = fileUrl;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      anchor.download = 'Vitae.pdf';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    } catch (err) {
      console.error('Failed to download vitae:', err);
      // Fallback: try opening the endpoint directly
      try {
        window.open(`${process.env.REACT_APP_BACKEND_URI}/api/cv/url`, '_blank');
      } catch (_) {
        // no-op
      }
    }
  };
  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="space-y-12"
        >
          {/* Main Content */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-gray-900">About Me</h2>
              <a
                href="#"
                onClick={handleDownloadVitae}
                className="inline-flex items-center text-crimson-600 hover:text-crimson-700 transition"
              >
                <span className="mr-2">Download Vitae</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </a>
            </div>
            
            <div className="prose max-w-none">
              <p className="text-gray-800 text-[17px] leading-relaxed mb-6 text-left text-justify hyphens-auto">
                Craig L. Johnson is a Professor at the Paul H. O'Neill School of Public and Environmental Affairs at Indiana University Bloomington. Dr. Johnson is a public financial management scholar who studies public finance and budgeting; state and local borrowing; the municipal securities market; tax increment finance and economic development; financial condition analysis and municipal finance. Dr. Johnson is a prolific author with over 170 peer-reviewed journal articles, books, book chapters, contract research reports and policy papers, and papers and presentations at academic and practitioner professional conferences. Dr. Johnson has served on several editorial boards of major public financial management journals, and he is currently the Co-Editor of the scholarly journal, Public Budgeting & Finance.
              </p>
              <p className="text-gray-800 text-[17px] leading-relaxed mb-6 text-left text-justify hyphens-auto">
                Much of my published research has appeared in journals that are among the world's most prestigious and highly ranked outlets in my field of study. My research has had a significant impact internationally and across disciplines and fields of study. I have been recognized for excellence in research by the Association for Budgeting and Financial Management's flagship journal, Public Budgeting & Finance.
              </p>
              <p className="text-gray-800 text-[17px] leading-relaxed mb-6 text-left text-justify hyphens-auto">
                My work has garnered the attention of policymakers, practitioners, and members of the broader community, resulting in media coverage and numerous opportunities for consulting and advising prestigious organizations. In addition, the United States Supreme Court has cited my work in the case Department of Revenue of Kentucky, et al., Petitioners v. George W. Davis, et ux. (No. 060666, 128 S. Ct. 1801), May 18, 2008. 
              </p>
              <p className="text-gray-800 text-[17px] leading-relaxed mb-6 text-left text-justify hyphens-auto">
                I have taken my expertise and research interests into the classroom where I have taught courses in public finance and budgeting, state and local debt finance, financial markets, financial institutions and instruments, financial management, environmental finance, E-government finance, economic development, and infrastructure finance, to thousands of undergraduate, graduate, and doctoral students at Indiana University. Since coming to O'Neill SPEA, I have received five teaching awards, including the Trustees Teaching Award. I have also provided extensive service to O'Neill SPEA, the university, the profession, and the community. 
              </p>
            </div>
          </div>

          {/* Research Domains Section */}
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-gray-900">Research Domains</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="mb-4">
                  <img 
                    src="/images/financial-market.webp" 
                    alt="Financial Market" 
                    className="w-full h-92 object-cover rounded-lg"
                  />
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-crimson-100 text-crimson-600">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="ml-4 text-black-800" style={{ fontSize: '19px' }}>Public Finance and Financial Management</p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="mb-4">
                  <img 
                    src="/images/public-finance.webp" 
                    alt="Public Finance" 
                    className="w-full h-92 object-cover rounded-lg"
                  />
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-crimson-100 text-crimson-600">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="ml-4 text-gray-800" style={{ fontSize: '19px' }}>Financial Markets and Municipal Finance</p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="mb-4">
                  <img 
                    src="/images/tax-increments.webp" 
                    alt="Financial Market" 
                    className="w-full h-92 object-contain rounded-lg"
                  />
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-crimson-100 text-crimson-600">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="ml-4 text-gray-800" style={{ fontSize: '19px' }}>Tax Increment Finance and Economic Development</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About; 
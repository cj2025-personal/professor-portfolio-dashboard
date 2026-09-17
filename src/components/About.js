import React from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useScholar } from '../lib/useScholar';

/* All three artworks are 1024x1024, so they crop identically to the 2:1 tile
   and no per-item object-fit is needed. */
const researchDomains = [
  {
    image: '/images/financial-market.webp',
    title: 'Public Finance & Financial Management',
    blurb: 'Budgeting, financial condition analysis, and the management of public resources.',
  },
  {
    image: '/images/public-finance.webp',
    title: 'Financial Markets & Municipal Finance',
    blurb: 'State and local borrowing and the structure of the municipal securities market.',
  },
  {
    image: '/images/tax-increments.webp',
    title: 'Tax Increment Finance & Economic Development',
    blurb: 'Development finance tools and their fiscal impact on communities.',
  },
];

const About = () => {
  const { scholar } = useScholar();
  const bioLead = scholar.about?.lead || '';
  const aboutBlocks = [...(scholar.about?.blocks || [])].sort(
    (a, b) => (a.order || 0) - (b.order || 0)
  );

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
    <section id="about" className="ark-band--tint ark-section">
      <div className="ark-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true, margin: '-80px' }}
        >
          {/* The section previously opened with an unlabelled card and a
              lone button floating at the right margin. It now announces
              itself, and the vitae sits on the heading baseline where a
              section-level action belongs. */}
          <div className="sec-head">
            <div className="sec-head__row">
              <div>
                <p className="sec-eyebrow">Profile</p>
                <h2 className="sec-title">About</h2>
              </div>
              <button type="button" onClick={handleDownloadVitae} className="btn-secondary whitespace-nowrap">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download vitae
              </button>
            </div>
          </div>

          {/* Biography. The lead is set at reading width and one step up in
              size — it is the only long-form prose on the homepage and was
              previously the same 15px as every caption around it. */}
          <div className="about-biography">
            <p className="text-[1.0625rem] leading-[1.75] text-gray-800">
              {bioLead}
            </p>

            {aboutBlocks.length > 0 && (
              <div className="about-blocks">
                {aboutBlocks.map((block) => (
                  <div key={block.label} className="about-block">
                    <p className="ark-kicker">{block.label}</p>
                    <p className="mt-2.5 text-sm leading-relaxed text-gray-600">{block.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Research domains */}
          <div className="mt-8">
            <div className="mb-5 flex items-end justify-between gap-6">
              <h3 className="type-subheading text-gray-900">Research domains</h3>
              <span className="ark-meta hidden sm:block">Three areas of continuing work</span>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {researchDomains.map((domain, i) => (
                <article key={domain.title} className="domain ark-card ark-card--lift overflow-hidden">
                  <div className="domain__figure h-32">
                    <img src={domain.image} alt="" loading="lazy" aria-hidden />
                    <span className="domain__index">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <div className="p-5">
                    <h4 className="type-card-title md:min-h-[3.375rem] text-gray-900">
                      {domain.title}
                    </h4>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">{domain.blurb}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;

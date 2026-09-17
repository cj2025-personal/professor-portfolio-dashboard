import React from 'react';
import { Link } from 'react-scroll';
import { Link as RouterLink } from 'react-router-dom';
import useArchivynContent from '../lib/useArchivynContent';
import { useScholar, initials, affiliationLine } from '../lib/useScholar';

const quickLinks = [
  { name: 'Home', href: 'home' },
  { name: 'About', href: 'about' },
  { name: 'Research', href: 'ongoing-research' },
  { name: 'Publications', href: 'publications' },
  { name: 'Teaching', href: 'teaching' },
  { name: 'Contact', href: 'contact' },
];

const Footer = () => {
  const { scholar } = useScholar();
  const { content } = useArchivynContent();
  const year = new Date().getFullYear();

  return (
    /* The signature red rule closes the page the same way it opens each
       section heading. */
    <footer className="ark-stripe bg-gray-900 text-gray-300">
      <div className="ark-container py-10">
        <div className="grid grid-cols-2 gap-7 lg:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-3">
              <span className="ark-display flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-[0.9375rem] text-white">
                {initials(scholar)}
              </span>
              <div className="leading-tight">
                <p className="ark-display text-[1.0625rem] text-white">{scholar.name}</p>
                <p className="mt-0.5 text-sm text-gray-400">{scholar.tagline}</p>
              </div>
            </div>
            <p className="mt-5 text-sm text-gray-400 leading-relaxed max-w-md">
              {[scholar.title, affiliationLine(scholar)].filter(Boolean).join(' at the ')}
              {scholar.researchFocus?.length
                ? `. Researching ${scholar.researchFocus.slice(0, 3).join(', ')}.`
                : ''}
            </p>
            {content?.footerLabel && <RouterLink to="/proj-arch" className="portfolio-platform__credit">{content.footerLabel}</RouterLink>}
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-white">
              Navigate
            </h3>
            <ul className="mt-4 space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    href={`#${link.href}`}
                    smooth={true}
                    duration={500}
                    offset={-88}
                    className="text-sm text-gray-400 hover:text-white cursor-pointer transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-white">
              Contact
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-gray-400">
              <li>
                <a
                  href="mailto:crljohns@iu.edu"
                  className="hover:text-white transition-colors"
                >
                  crljohns@iu.edu
                </a>
              </li>
              <li>812-855-0742</li>
              <li className="leading-relaxed">
                1315 E. 10th Street
                <br />
                Bloomington, IN 47405
              </li>
              <li>
                <a
                  href="https://substack.com/@craigljohnson1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-brand-300 hover:text-white transition-colors font-medium"
                >
                  Substack
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        {/* Translucent white, not a grey step: the sheet defines only three
            inks, so gray-800 and gray-900 collapse to the same value and the
            rule was invisible against this ground. */}
        <div className="mt-7 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            &copy; {year} {scholar.name}. All rights reserved.
          </p>
          <p className="text-xs text-gray-400">
            {[scholar.department, scholar.institution].filter(Boolean).join(' · ')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

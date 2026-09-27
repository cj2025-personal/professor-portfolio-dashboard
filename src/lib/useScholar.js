import { useEffect, useState } from 'react';
import axios from 'axios';

/**
 * The scholar record the site renders itself from.
 *
 * Name, title, affiliation and tagline used to be literals in the hero,
 * footer, navbar and chatbot — five places to edit for one person, and a
 * guarantee that the portfolio could only ever be about them. Served from
 * /api/scholar/profile it becomes a scholar-shaped site with one scholar in
 * it, which is what a directory demo needs to show.
 *
 * The fallback is not a second copy of the data: it is the minimum needed to
 * keep the layout from collapsing while the request is in flight or if the
 * API is down. Anything richer belongs in the record.
 */

const API = process.env.REACT_APP_BACKEND_URI;

const SKELETON = {
  name: '',
  title: '',
  tagline: '',
  institution: '',
  department: '',
  photoUrl: '',
  isVerified: false,
  about: { lead: '', blocks: [] },
  researchFocus: [],
  linksAndMedia: { socialProfiles: [], references: [] },
};

let cached = null;
// The request in flight. The cache alone fills only when the response lands,
// so components mounting together (nav, hero, About, footer, chat) each used
// to start their own fetch; now they share this one.
let request = null;

export function useScholar() {
  const [scholar, setScholar] = useState(cached || SKELETON);
  const [loaded, setLoaded] = useState(Boolean(cached));

  useEffect(() => {
    if (cached) return undefined;
    let cancelled = false;

    if (!request) {
      request = axios.get(`${API}/api/scholar/profile`)
        .then((res) => {
          const data = res.data?.data;
          if (data) cached = { ...SKELETON, ...data, about: { ...SKELETON.about, ...(data.about || {}) } };
          return cached;
        })
        // Layout holds on the skeleton; nothing is invented. A later mount retries.
        .catch(() => { request = null; return null; });
    }
    request.then((data) => {
      if (cancelled) return;
      if (data) setScholar(data);
      setLoaded(true);
    });

    return () => { cancelled = true; };
  }, []);

  return { scholar, loaded };
}

/** "Professor · O'Neill School, Indiana University Bloomington" */
export function affiliationLine(scholar) {
  return [scholar.department, scholar.institution].filter(Boolean).join(', ');
}

/**
 * Initials for the brand mark, derived rather than stored.
 *
 * Three letters, not two: the middle initial is part of how this name is
 * published, so "Craig L. Johnson, Ph.D." reads CLJ. Trailing credentials are
 * dropped at the comma before any of this runs.
 */
export function initials(scholar) {
  if (!scholar.name) return '';
  return scholar.name
    .replace(/,.*$/, '')
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 3)
    .map((w) => w[0].toUpperCase())
    .join('');
}

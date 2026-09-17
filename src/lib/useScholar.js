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

export function useScholar() {
  const [scholar, setScholar] = useState(cached || SKELETON);
  const [loaded, setLoaded] = useState(Boolean(cached));

  useEffect(() => {
    if (cached) return undefined;
    let cancelled = false;

    (async () => {
      try {
        const res = await axios.get(`${API}/api/scholar/profile`);
        const data = res.data?.data;
        if (data && !cancelled) {
          // One fetch per page load, shared across every component that asks.
          cached = { ...SKELETON, ...data, about: { ...SKELETON.about, ...(data.about || {}) } };
          setScholar(cached);
        }
      } catch (_) {
        // Layout holds on the skeleton; nothing is invented.
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();

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

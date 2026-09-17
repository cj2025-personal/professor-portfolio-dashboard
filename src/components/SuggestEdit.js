import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { PencilSquareIcon, XMarkIcon } from '@heroicons/react/24/outline';

/**
 * Section-level "suggest an edit", ported from ScholarProfileView's
 * SuggestButton. A scholar record on this platform is correctable by the
 * people who know it — the coarse, per-section variant is used here rather
 * than the profile app's per-field pencils because the portfolio's sections
 * are correspondingly coarse.
 *
 * `currentText` is a plain-text snapshot of what the section says now. It
 * travels with the suggestion so a reviewer can judge it without opening the
 * site — the same trick ScholarProfileView uses.
 */

const API = process.env.REACT_APP_BACKEND_URI;

export function SuggestButton({ sectionKey, label, currentText, className = '' }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Suggest an edit to ${label}`}
        title={`Suggest an edit to ${label}`}
        className={`inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-brand-600 transition-colors ${className}`}
      >
        <PencilSquareIcon className="w-4 h-4" />
        <span className="hidden sm:inline">Suggest an edit</span>
      </button>

      <SuggestModal
        open={open}
        sectionKey={sectionKey}
        label={label}
        currentText={currentText}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

function SuggestModal({ open, sectionKey, label, currentText, onClose }) {
  const dialogRef = useRef(null);
  const firstFieldRef = useRef(null);
  const [suggestion, setSuggestion] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle'); // idle | sending | sent | error
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && firstFieldRef.current) firstFieldRef.current.focus();
    if (open) {
      setSuggestion('');
      setEmail('');
      setState('idle');
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const submit = async (e) => {
    e.preventDefault();
    if (!suggestion.trim()) return;
    setState('sending');
    setError(null);
    try {
      await axios.post(`${API}/api/suggestions`, {
        sectionKey,
        label,
        currentText: currentText || null,
        suggestion: suggestion.trim(),
        submittedBy: email.trim() || null,
      });
      setState('sent');
    } catch (err) {
      // The endpoint is not built yet; say so plainly rather than pretending
      // the suggestion was filed.
      setState('error');
      setError(
        err?.response?.status === 404
          ? 'Suggestions are not being accepted yet. The review queue is still being set up.'
          : 'Could not send the suggestion. Please try again.'
      );
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[1500] flex items-center justify-center p-4"
          style={{ background: 'rgba(23,32,51,0.55)' }}
          onClick={onClose}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="suggest-title"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            onClick={(e) => e.stopPropagation()}
            className="ark-stripe relative w-full max-w-lg bg-white shadow-lg overflow-hidden"
            style={{ borderRadius: 'var(--ark-radius-modal)' }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-3.5 right-3.5 w-8 h-8 grid place-items-center rounded-full text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>

            <div className="px-6 pt-7 pb-6">
              <p className="text-[0.6rem] font-bold uppercase tracking-[0.09em] text-gray-500">
                Suggest an edit
              </p>
              <h2 id="suggest-title" className="mt-1 text-lg font-extrabold text-gray-900">
                {label}
              </h2>

              {state === 'sent' ? (
                <div className="mt-5">
                  <p className="text-sm text-gray-800">
                    Thank you. Your suggestion has been filed for review.
                  </p>
                  <div className="mt-5 flex justify-end">
                    <button type="button" onClick={onClose} className="btn-primary !px-4 !py-2 text-sm">
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={submit} className="mt-4">
                  {currentText && (
                    <div className="mb-4">
                      <p className="text-[0.6rem] font-bold uppercase tracking-[0.09em] text-gray-500 mb-1.5">
                        Currently reads
                      </p>
                      <p className="max-h-28 overflow-y-auto rounded-lg bg-gray-50 border border-gray-100 px-3 py-2 text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                        {currentText}
                      </p>
                    </div>
                  )}

                  <label htmlFor="suggestion-body" className="block text-sm font-semibold text-gray-800 mb-1.5">
                    What should it say instead?
                  </label>
                  <textarea
                    id="suggestion-body"
                    ref={firstFieldRef}
                    required
                    rows={5}
                    value={suggestion}
                    onChange={(e) => setSuggestion(e.target.value)}
                    className="w-full rounded-control border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-brand-600 focus:outline-none"
                    placeholder="Describe the correction, and cite a source if you have one."
                  />

                  <label htmlFor="suggestion-email" className="block text-sm font-semibold text-gray-800 mt-4 mb-1.5">
                    Your email <span className="font-normal text-gray-500">(optional)</span>
                  </label>
                  <input
                    id="suggestion-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-control border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-brand-600 focus:outline-none"
                    placeholder="So a reviewer can follow up"
                  />

                  {error && <p className="mt-3 text-sm text-red-700">{error}</p>}

                  <div className="mt-5 flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="btn-secondary !px-4 !py-2 text-sm">
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={state === 'sending' || !suggestion.trim()}
                      className="btn-primary !px-4 !py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {state === 'sending' ? 'Sending…' : 'Send suggestion'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SuggestButton;

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';

/**
 * AI disclosure shown before the first turn of any assistant session.
 *
 * Ported from ngo-profile-app's AiDisclosureModal. Required by California
 * SB 243 (Companion Chatbots Act, effective 1 Jan 2026) — the user must be
 * told they are talking to an AI, what its limits are, and what happens to
 * what they type. Copy below is a placeholder pending legal review, same
 * caveat the source component carries.
 */

const COPY = {
  en: {
    title: "You're chatting with an AI assistant",
    lead: (botName) => (
      <>
        <strong>{botName}</strong> is an <strong>AI assistant</strong>, not
        Professor Johnson and not a person. It answers from his published
        research, courses, and public biography.
      </>
    ),
    body:
      'It can be wrong or incomplete, so check anything that matters against the sources it cites. Please do not share personal details such as your address, phone number, or student ID. Your messages are processed to generate a reply.',
    decline: 'Not now',
    accept: 'Got it, start chatting',
  },
  es: {
    title: 'Estás chateando con un asistente de IA',
    lead: (botName) => (
      <>
        <strong>{botName}</strong> es un <strong>asistente de IA</strong>, no el
        profesor Johnson ni una persona. Responde a partir de su investigación
        publicada, sus cursos y su biografía pública.
      </>
    ),
    body:
      'Puede equivocarse o dar respuestas incompletas, así que verifica lo importante con las fuentes que cita. Por favor, no compartas datos personales como tu dirección, teléfono o identificación de estudiante. Tus mensajes se procesan para generar una respuesta.',
    decline: 'Ahora no',
    accept: 'Entendido, empezar',
  },
  fr: {
    title: "Vous discutez avec un assistant IA",
    lead: (botName) => (
      <>
        <strong>{botName}</strong> est un <strong>assistant IA</strong>, ni le
        professeur Johnson, ni une personne. Il répond à partir de ses
        recherches publiées, de ses cours et de sa biographie publique.
      </>
    ),
    body:
      "Il peut se tromper ou être incomplet : vérifiez ce qui compte auprès des sources citées. Merci de ne pas partager de données personnelles comme votre adresse, votre téléphone ou votre numéro d'étudiant. Vos messages sont traités pour générer une réponse.",
    decline: 'Pas maintenant',
    accept: "C'est compris, commencer",
  },
};

export default function AiDisclosureModal({ open, botName, language = 'en', onAcknowledge, onClose }) {
  const dialogRef = useRef(null);
  const acceptRef = useRef(null);
  const copy = COPY[language] || COPY.en;

  useEffect(() => {
    if (open && acceptRef.current) acceptRef.current.focus();
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
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-disclosure-title"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            className="ark-stripe relative w-full max-w-md bg-white shadow-lg overflow-hidden"
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
              <div className="flex items-center gap-3 mb-3">
                <span className="flex-none w-9 h-9 grid place-items-center rounded-control bg-brand-100 text-brand-600">
                  <SparklesIcon className="w-5 h-5" />
                </span>
                <h2
                  id="ai-disclosure-title"
                  className="text-base font-extrabold text-gray-900 leading-snug pr-6"
                >
                  {copy.title}
                </h2>
              </div>

              <p className="text-[0.95rem] text-gray-800 leading-relaxed mb-2.5">
                {copy.lead(botName)}
              </p>
              <p className="text-sm text-gray-500 leading-relaxed">{copy.body}</p>

              <div className="mt-6 flex justify-end gap-2">
                <button type="button" onClick={onClose} className="btn-secondary !px-4 !py-2 text-sm">
                  {copy.decline}
                </button>
                <button
                  ref={acceptRef}
                  type="button"
                  onClick={onAcknowledge}
                  className="btn-primary !px-4 !py-2 text-sm"
                >
                  {copy.accept}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import AiDisclosureModal from './AiDisclosureModal';
import ComprehensionCheck from './ComprehensionCheck';
import { useScholar } from '../lib/useScholar';

/* Acknowledgement is remembered per browser so the disclosure interrupts once,
   not on every visit. Clearing site data re-arms it. */
const AI_DISCLOSURE_KEY = 'aiDisclosureAcknowledgedV1';

/* Mirrors utils/readingLevel.js. Held locally so the picker renders on first
   paint; the API resolves and validates whatever it receives, and superseded
   values still map, so a stale label here cannot corrupt a request.

   K-14. The 12 / 13-14 split is deliberate and is the point of the model: that
   is where a reader stops being taught a discipline's conclusions and starts
   being expected to reason inside it. */
const READING_LEVELS = [
  { key: 'k_2', label: 'K–2', hint: 'Ages 5–8 · one idea per sentence, everyday words' },
  { key: 'g3_5', label: '3–5', hint: 'Ages 8–11 · plain words, a concrete example' },
  { key: 'g6_8', label: '6–8', hint: 'Ages 11–14 · real terms, defined as they appear' },
  { key: 'g9_11', label: '9–11', hint: 'Ages 14–17 · subject terminology, reasoning shown' },
  { key: 'g12', label: '12', hint: 'College-ready · argument structure made visible, terms defined once' },
  { key: 'g13_14', label: '13–14', hint: 'Undergraduate · full disciplinary register, limits of the claim stated' },
];
 
const translations = {
  en: {
    welcome: (botName, who) => `Hi! I'm your ${botName}. I can help you learn about ${who}'s research, courses, and background. Type your question below!`,
    inputPlaceholder: "Type your message...",
    contactInfo: "For further information, please contact crljohns@iu.edu.",
    resultsHeading: "This is what I found for you:"
  },
  es: {
    welcome: (botName, who) => `¡Hola! Soy tu ${botName}. Puedo ayudarte a aprender sobre la investigación, los cursos y los antecedentes de ${who}. ¡Escribe tu pregunta a continuación!`,
    inputPlaceholder: "Escribe tu mensaje...",
    contactInfo: "Para más información, por favor contacta a crljohns@iu.edu.",
    resultsHeading: "Esto es lo que encontré para ti:"
  },
  fr: {
    welcome: (botName, who) => `Bonjour ! Je suis votre ${botName}. Je peux vous aider à en savoir plus sur la recherche, les cours et le parcours de ${who}. Tapez votre question ci-dessous !`,
    inputPlaceholder: "Tapez votre message...",
    contactInfo: "Pour plus d'informations, veuillez contacter crljohns@iu.edu.",
    resultsHeading: "Voici ce que j'ai trouvé pour vous :"
  }
};

/**
 * Turn the rendered conversation into a transcript the API can resolve against.
 *
 * Only what was actually said goes across. The opening greeting is dropped
 * because it carries no subject, and the contact-line fallback shown when a
 * request fails is dropped because it is UI text, not an answer — including
 * either would give the resolver a turn to resolve pronouns against that never
 * described anything.
 *
 * The server caps and sanitises this again on arrival. Trimming here is for
 * bandwidth and cost, not safety: nothing sent from a browser can be trusted
 * by the thing receiving it, including when the browser is ours.
 */
const HISTORY_TURNS = 6;

const buildHistory = (messages) => messages
  .filter((m) => m.id !== 1)
  .filter((m) => m.sender === 'user' || m.checkable)
  .slice(-HISTORY_TURNS)
  .map((m) => ({
    role: m.sender === 'user' ? 'user' : 'assistant',
    text: String(m.text || '').slice(0, 1500)
  }));

const Chatbot = () => {
  const { scholar } = useScholar();
  const botName = process.env.REACT_APP_BOT_NAME || "Johnson's Assistant";
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem('chatbotLanguage') || 'en';
  });
  /* Reading level the answer is rendered at. Archivyn derives this from the
     signed-in learner; with no auth layer here the visitor picks it. Defaults
     to college so an unselected visitor gets today's behaviour unchanged. */
  const [readingLevel, setReadingLevel] = useState(() => {
    return localStorage.getItem('chatbotReadingLevel') || 'g13_14';
  });
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [originalMessages, setOriginalMessages] = useState([]); // Store original messages for translation
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);
 
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const [disclosureAcknowledged, setDisclosureAcknowledged] = useState(() => {
    try {
      return localStorage.getItem(AI_DISCLOSURE_KEY) === 'true';
    } catch (_) {
      return false;
    }
  });
  const [showDisclosure, setShowDisclosure] = useState(false);

  // SB 243: the disclosure has to land before the first turn, so opening the
  // panel without an acknowledgement on file shows it instead.
  const openChat = () => {
    if (!disclosureAcknowledged) {
      setShowDisclosure(true);
      return;
    }
    setIsOpen(true);
  };

  const acknowledgeDisclosure = () => {
    try {
      localStorage.setItem(AI_DISCLOSURE_KEY, 'true');
    } catch (_) {
      // Storage unavailable (private mode) — the session still proceeds, the
      // disclosure simply shows again next time.
    }
    setDisclosureAcknowledged(true);
    setShowDisclosure(false);
    setIsOpen(true);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize messages only on mount
  useEffect(() => {
    const initialMessage = {
      id: 1,
      text: translations[selectedLanguage].welcome(botName, scholar.name || 'this scholar'),
      sender: 'bot',
      timestamp: new Date(),
      originalLanguage: selectedLanguage
    };
    setMessages([initialMessage]);
    setOriginalMessages([initialMessage]);
    checkStatus();
    // Mount-only by design: botName and selectedLanguage are read to seed the
    // first message, but re-running on either would wipe the conversation.
    // Language changes are handled by the translation effect below instead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Translate messages when language changes
  useEffect(() => {
    if (originalMessages.length === 0) return; // Skip if no messages yet
    
    const translateMessages = async () => {
      setIsTranslating(true);
      try {
        const translatedMessages = await Promise.all(
          originalMessages.map(async (msg) => {
            // If it's the welcome message, use translation directly
            if (msg.id === 1 && msg.sender === 'bot' && (msg.text.includes('Hi!') || msg.text.includes('¡Hola!') || msg.text.includes('Bonjour'))) {
              return {
                ...msg,
                text: translations[selectedLanguage].welcome(botName, scholar.name || 'this scholar'),
                originalLanguage: selectedLanguage
              };
            }
            
            // If message is already in the target language, no translation needed
            if (msg.originalLanguage === selectedLanguage) {
              return msg;
            }
            
            // Translate using backend
            try {
              const response = await fetch(`${process.env.REACT_APP_BACKEND_URI}/api/translate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  text: msg.text,
                  targetLanguage: selectedLanguage,
                  sourceLanguage: msg.originalLanguage || 'en'
                })
              });
              
              const data = await response.json();
              if (data.success && data.translatedText) {
                return {
                  ...msg,
                  text: data.translatedText,
                  originalLanguage: selectedLanguage
                };
              }
            } catch (error) {
              console.error('Translation error:', error);
              // Fallback: return original message if translation fails
              return msg;
            }
            
            return msg;
          })
        );
        
        setMessages(translatedMessages);
      } catch (error) {
        console.error('Error translating messages:', error);
      } finally {
        setIsTranslating(false);
      }
    };
    
    translateMessages();
    // originalMessages is read but deliberately not a dependency: including it
    // would re-translate the entire history on every new message.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLanguage, botName]);

  const checkStatus = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URI}/api/rag/status`);
      const data = await response.json();
      const active = data?.success && (data?.status?.isActive ?? true);
      setIsOnline(!!active);
    } catch (error) {
      console.error('Error checking chatbot status:', error);
      setIsOnline(false);
    }
  };

  const buildTopFive = (resultsObj) => {
    if (!resultsObj || typeof resultsObj !== 'object') return [];
    const buckets = ['courses', 'publications', 'research', 'topics', 'modules', 'lectures'];
    const flattened = [];
    buckets.forEach((bucket) => {
      const arr = Array.isArray(resultsObj[bucket]) ? resultsObj[bucket] : [];
      arr.forEach((item) => {
        const similarity = item?.similarity ?? item?.score ?? item?.meta?.similarity ?? null;
        const data = item?.data || item;
        flattened.push({ type: bucket.slice(0, -1) || 'item', data, similarity, text: item?.text || data?.title || data?.name || '' });
      });
    });
    // Prefer similarity if present, else keep order
    const withSimilarity = flattened.some(f => typeof f.similarity === 'number');
    const sorted = withSimilarity
      ? flattened.sort((a, b) => (b.similarity ?? -Infinity) - (a.similarity ?? -Infinity))
      : flattened;
    return sorted.slice(0, 5);
  };

  const sendMessage = async (messageText = null) => {
    const textToSend = messageText || inputMessage.trim();
    if (!textToSend || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date(),
      originalLanguage: selectedLanguage
    };

    setMessages(prev => [...prev, userMessage]);
    setOriginalMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
 

    try {
      // 1) Ask the RAG chat endpoint to generate a professional answer
      const answerRes = await fetch(`${process.env.REACT_APP_BACKEND_URI}/api/rag/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.text,
          language: selectedLanguage,
          readingLevel,
          history: buildHistory(messages)
        })
      });
      const answerData = await answerRes.json();
      const contactLine = translations[selectedLanguage].contactInfo;
      const rawAnswer = (typeof answerData?.response === 'string') ? answerData.response.trim() : '';
      const looksLikeError = /trouble processing|please try again|technical difficulties/i.test(rawAnswer);
      const hasAnswer = !!rawAnswer && answerData?.success !== false && !looksLikeError;

      // 2) Retrieve top semantic matches (pure semantic)
      const semResponse = await fetch(`${process.env.REACT_APP_BACKEND_URI}/api/rag/semantic-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage.text, 
          threshold: 0.5,
          language: selectedLanguage
        })
      });
      const semData = await semResponse.json();

      const topFive = semData?.success ? buildTopFive(semData.results) : [];

      const botMessage = {
        id: Date.now() + 1,
        text: hasAnswer ? rawAnswer : contactLine,
        sender: 'bot',
        timestamp: new Date(),
        results: topFive,
        originalLanguage: selectedLanguage,
        // Carried so a comprehension check can be grounded in the same
        // question the answer was retrieved for. Only real answers qualify -
        // the contact-line fallback has nothing to check.
        checkable: hasAnswer,
        sourceQuestion: userMessage.text
      };
      setMessages(prev => [...prev, botMessage]);
      setOriginalMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: translations[selectedLanguage].contactInfo,
        sender: 'bot',
        timestamp: new Date(),
        originalLanguage: selectedLanguage
      };
      setMessages(prev => [...prev, errorMessage]);
      setOriginalMessages(prev => [...prev, errorMessage]);
        
       
    } finally {
      setIsLoading(false);
    }
  };

 

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Time, not date: a session happens in one sitting, so a date stamp on every
  // bubble was noise. The day is implicit; the minute is what orients you.
  const formatTime = (timestamp) =>
    timestamp.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

  const avatarSrc = process.env.REACT_APP_BOT_AVATAR_URL || '/images/craig-avatar.png';

  return (
    <>
      <AiDisclosureModal
        open={showDisclosure}
        botName={botName}
        language={selectedLanguage}
        onAcknowledge={acknowledgeDisclosure}
        onClose={() => setShowDisclosure(false)}
      />

      {/* Launcher. Hidden while the panel is open: the panel carries its own
          close control, and two close affordances on one surface is one too many. */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="chat-launcher"
            onClick={openChat}
            aria-label="Open the AI assistant"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="cb-launcher fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full bg-brand-600 py-3.5 pl-4 pr-5 text-white transition-colors hover:bg-brand-700"
          >
            <ChatBubbleLeftRightIcon className="h-5 w-5" aria-hidden />
            <span className="text-sm font-semibold">Ask about the research</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32, mass: 0.8 }}
            style={{ transformOrigin: 'bottom right' }}
            role="dialog"
            aria-modal="false"
            aria-label={botName + ", AI assistant"}
            className="cb-panel fixed bottom-6 right-6 z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="cb-head flex items-center gap-3 px-4 py-3.5">
              <div className="relative flex-none">
                <button
                  type="button"
                  onClick={() => setIsAvatarOpen(true)}
                  aria-label="View portrait"
                  className="block rounded-full"
                >
                  <img src={avatarSrc} alt={scholar.name} className="cb-avatar" />
                </button>
                <span className={`cb-dot ${isOnline ? 'cb-dot--on' : 'cb-dot--off'}`} aria-hidden />
                <span className="sr-only">
                  {isOnline ? 'Assistant online' : 'Assistant offline'}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-sm font-bold leading-tight">
                  <span className="truncate">{scholar.name}</span>
                  {/* Persistent, not only at first open: the panel carries his
                      name and photo, so the AI marker has to stay put. */}
                  <span className="cb-badge">AI</span>
                </p>
                <p className="mt-0.5 text-[0.7rem] leading-tight text-white/70">
                  Answers from published research, not the professor
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close the assistant"
                className="cb-close grid h-8 w-8 flex-none place-items-center"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Conversation */}
            <div className="cb-log flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((message) => {
                const isUser = message.sender === 'user';
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    {/* No per-message avatar: the header already establishes who
                        is speaking, and alignment carries the rest. */}
                    <div className={`cb-bubble ${isUser ? 'cb-bubble--me' : 'cb-bubble--bot'}`}>
                      <p className="whitespace-pre-line">{message.text}</p>

                      {!isUser && Array.isArray(message.results) && message.results.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs font-semibold text-gray-700 mb-2">
                            {translations[selectedLanguage].resultsHeading}
                          </p>
                          <ul className="space-y-2">
                            {message.results.map((r, idx) => (
                              <li key={idx} className="text-xs leading-snug">
                                <span className="inline-block rounded bg-gray-100 text-gray-600 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.06em] mr-1.5 align-middle">
                                  {r.type}
                                </span>
                                <span className="text-gray-700">
                                  {r.data?.title || r.data?.name || r.text}
                                </span>
                                {/* The raw similarity score used to print here.
                                    That is a debugging number, not reader copy. */}
                                {r.data?.link && (
                                  <a
                                    href={r.data.link}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    className="ml-1.5 font-semibold text-brand-600 hover:underline whitespace-nowrap"
                                  >
                                    Open
                                  </a>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {!isUser && message.checkable && (
                      <div className="max-w-[85%] mt-1.5">
                        <ComprehensionCheck
                          question={message.sourceQuestion}
                          answer={message.text}
                        />
                      </div>
                    )}

                    <span className="cb-time">
                      {formatTime(message.timestamp)}
                    </span>
                  </motion.div>
                );
              })}

              {isTranslating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-center"
                >
                  <span className="rounded-full bg-blue-100 text-blue-800 text-xs px-3 py-1.5">
                    Translating conversation...
                  </span>
                </motion.div>
              )}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                  role="status"
                  aria-label="Assistant is typing"
                >
                  <div className="cb-typing">
                    <span />
                    <span />
                    <span />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Composer */}
            <div className="cb-composer px-3.5 pb-3.5 pt-3">
              {/* Explain-it-at level. Archivyn reads this off the signed-in
                  learner; with no auth here the visitor sets it, and it takes
                  effect on the next answer. */}
              <div className="cb-reading-setting">
                <label htmlFor="chat-reading-level" className="cb-reading-label">
                  Explain it for grade
                </label>
                <div className="cb-reading-picker">
                  <select
                    id="chat-reading-level"
                    value={readingLevel}
                    title={READING_LEVELS.find((lvl) => lvl.key === readingLevel)?.hint}
                    onChange={(event) => {
                      const level = event.target.value;
                      setReadingLevel(level);
                      try {
                        localStorage.setItem('chatbotReadingLevel', level);
                      } catch (_) {
                        // Private mode - the choice still applies this session.
                      }
                    }}
                    className="cb-reading-select"
                  >
                    {READING_LEVELS.map((lvl) => (
                      <option key={lvl.key} value={lvl.key}>{lvl.label}</option>
                    ))}
                  </select>
                  <ChevronDownIcon className="cb-reading-chevron" aria-hidden="true" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="cb-field flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={translations[selectedLanguage].inputPlaceholder}
                    disabled={isLoading}
                    aria-label="Message"
                    className="cb-input disabled:opacity-60"
                  />
                  {/* A settings control should not look like the primary action,
                      so the language picker is quiet text rather than a filled
                      navy button competing with Send. */}
                  <label className="sr-only" htmlFor="chat-language">
                    Language
                  </label>
                  <select
                    id="chat-language"
                    value={selectedLanguage}
                    onChange={(e) => {
                      const newLang = e.target.value;
                      setSelectedLanguage(newLang);
                      localStorage.setItem('chatbotLanguage', newLang);
                    }}
                    className="cb-lang"
                  >
                    <option value="en">EN</option>
                    <option value="es">ES</option>
                    <option value="fr">FR</option>
                  </select>
                </div>

                {/* Always present, disabled when there is nothing to send. The
                    old button only appeared once you typed, shifting the row. */}
                <button
                  type="button"
                  onClick={() => sendMessage()}
                  disabled={isLoading || !inputMessage.trim()}
                  aria-label="Send message"
                  className="cb-send"
                >
                  <PaperAirplaneIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Portrait lightbox */}
      <AnimatePresence>
        {isAvatarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={`Portrait of ${scholar.name}`}
            className="fixed inset-0 z-[60] flex items-center justify-center p-6"
            style={{ background: 'rgba(23,32,51,0.8)' }}
            onClick={() => setIsAvatarOpen(false)}
          >
            <button
              type="button"
              onClick={() => setIsAvatarOpen(false)}
              aria-label="Close portrait"
              className="absolute top-5 right-5 w-10 h-10 grid place-items-center rounded-full text-white hover:bg-white/15 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <img
              src={avatarSrc}
              alt={scholar.name}
              className="max-w-[90vw] max-h-[80vh] rounded-xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;

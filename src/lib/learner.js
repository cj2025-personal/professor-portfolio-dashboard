/**
 * Per-browser learner identity.
 *
 * There is no auth layer here, so a "learner" is a random id in localStorage.
 * That is a real limitation, not a stand-in for one: clearing site data starts
 * a new profile, and a second browser is a second learner. Every surface that
 * shows this profile says so rather than implying an account.
 */

const LEARNER_KEY = 'archivyn:learner-id:v1';

export function getLearnerId() {
  try {
    let id = localStorage.getItem(LEARNER_KEY);
    if (!id) {
      id = `visitor-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(LEARNER_KEY, id);
    }
    return id;
  } catch (_) {
    // Private mode: the session still works, it just will not persist.
    return 'visitor-ephemeral';
  }
}

export function getReadingLevel() {
  try {
    return localStorage.getItem('chatbotReadingLevel') || 'g13_14';
  } catch (_) {
    return 'g13_14';
  }
}

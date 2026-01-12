/**
 * Session ID management utility
 * Generates and stores a unique session ID in localStorage
 * This acts as the user identifier for cart management
 */
const SESSION_ID_KEY = 'uniblox_session_id';

/**
 * Get or create a session ID
 * If no session ID exists, generates a new one and stores it
 */
export function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  
  if (!sessionId) {
    // Generate a unique session ID
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  
  return sessionId;
}

/**
 * Clear session ID (useful for logout or reset)
 */
export function clearSessionId(): void {
  localStorage.removeItem(SESSION_ID_KEY);
}

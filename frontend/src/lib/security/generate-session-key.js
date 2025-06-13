/**
 * Generate a unique session key for rate limiting
 * This ensures each browser session gets its own rate limit bucket
 */
export function generateSessionKey() {
  // Check if we already have a session key
  let sessionKey = sessionStorage.getItem('security-key');
  
  if (!sessionKey) {
    // Generate a new unique session key
    sessionKey = `session-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    sessionStorage.setItem('security-key', sessionKey);
    console.log('Generated new session key:', sessionKey);
  }
  
  return sessionKey;
}

// Initialize session key on load
if (typeof window !== 'undefined') {
  generateSessionKey();
}
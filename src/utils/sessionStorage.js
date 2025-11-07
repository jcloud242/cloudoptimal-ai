// Simple session storage utilities for CloudOptimal AI

const STORAGE_KEY = 'cloudoptimal_sessions';
const MAX_SESSIONS = 10; // Keep last 10 sessions

export function saveSession(sessionData) {
  try {
    const sessions = getSessions();
    const newSession = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...sessionData
    };
    
    // Add new session at the beginning
    const updatedSessions = [newSession, ...sessions.slice(0, MAX_SESSIONS - 1)];
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
    return newSession.id;
  } catch (error) {
    console.error('Failed to save session:', error);
    return null;
  }
}

export function getSessions() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to get sessions:', error);
    return [];
  }
}

export function getSession(sessionId) {
  try {
    const sessions = getSessions();
    return sessions.find(session => session.id === sessionId) || null;
  } catch (error) {
    console.error('Failed to get session:', error);
    return null;
  }
}

export function deleteSession(sessionId) {
  try {
    const sessions = getSessions();
    const filtered = sessions.filter(session => session.id !== sessionId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Failed to delete session:', error);
    return false;
  }
}

export function clearAllSessions() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear sessions:', error);
    return false;
  }
}
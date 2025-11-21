import { useState, useEffect } from 'react';
import { getSessions, deleteSession } from '../utils/sessionStorage';

export default function SessionHistory({ onLoadSession }) {
  const [sessions, setSessions] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = () => {
    const storedSessions = getSessions();
    setSessions(storedSessions);
  };

  const handleDeleteSession = (sessionId) => {
    if (deleteSession(sessionId)) {
      loadSessions();
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (sessions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div 
        className="px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-purple-900/30 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:from-purple-100 hover:to-pink-100 dark:hover:from-gray-700 dark:hover:to-purple-900/50 transition-all"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Previous Sessions
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50 px-3 py-1 rounded-full">
              {sessions.length}
            </span>
            <svg 
              className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-6 max-h-80 overflow-y-auto bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
          <div className="space-y-3">
            {sessions.map((session) => (
              <div key={session.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-bold text-purple-600 dark:text-purple-400 capitalize bg-purple-50 dark:bg-purple-900/30 px-2 py-1 rounded">
                        {session.promptType}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(session.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                      {session.userInput}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-3">
                    <button
                      onClick={() => onLoadSession(session)}
                      className="text-sm font-medium bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg transition-colors shadow-sm hover:shadow"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      className="text-sm font-medium bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition-colors shadow-sm hover:shadow"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
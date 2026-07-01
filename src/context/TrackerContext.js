import React, { createContext, useContext, useState, useEffect } from 'react';

const TrackerContext = createContext(null);

export const TrackerProvider = ({ children }) => {
  const [progress, setProgress] = useState({ completed: [], token: '' });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load tracking data from localStorage on mount
    const saved = localStorage.getItem('tpl_tracker_data');
    if (saved) {
      setProgress(JSON.parse(saved));
    }
    setIsLoaded(true);
  }, []);

  const toggleLesson = (id) => {
    const updated = { ...progress };
    if (updated.completed.includes(id)) {
      updated.completed = updated.completed.filter(item => item !== id);
    } else {
      updated.completed.push(id);
    }
    setProgress(updated);
    localStorage.setItem('tpl_tracker_data', JSON.stringify(updated));
  };

  const saveToken = (token) => {
    const updated = { ...progress, token };
    setProgress(updated);
    localStorage.setItem('tpl_tracker_data', JSON.stringify(updated));
  };

  return (
    <TrackerContext.Provider value={{ progress, isLoaded, toggleLesson, saveToken }}>
      {children}
    </TrackerContext.Provider>
  );
};

export const useTracker = () => useContext(TrackerContext);
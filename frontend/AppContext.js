import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [language, setLanguage] = useState(null); // e.g., 'Japanese' or 'Korean'
  const [progress, setProgress] = useState({ xp: 0, streak: 0, hearts: 5, gems: 0 });
  const [customPath, setCustomPath] = useState(null); // Stores the AI generated path

  return (
    <AppContext.Provider value={{ language, setLanguage, progress, setProgress, customPath, setCustomPath }}>
      {children}
    </AppContext.Provider>
  );
};

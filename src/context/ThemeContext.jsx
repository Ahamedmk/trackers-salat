// src/context/ThemeContext.jsx
import React, { createContext, useState } from 'react';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('#F2FFF2'); // valeur par défaut

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode, backgroundColor, setBackgroundColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

import React, { createContext, useContext, useState } from 'react';

const lightTheme = {
  background: '#fff',
  text: '#333',
  card: '#F5F5F5',
};

const darkTheme = {
  background: '#181A20',
  text: '#fff',
  card: '#23262F',
};

const ThemeContext = createContext({
  darkMode: false,
  setDarkMode: (v: boolean) => {},
  theme: lightTheme,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [darkMode, setDarkMode] = useState(false);
  const theme = darkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
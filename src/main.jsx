// src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { ThemeProvider } from './context/ThemeContext'; // Notre contexte de thème
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeContext } from './context/ThemeContext'; // Import du contexte pour accéder à backgroundColor
import { useContext } from 'react';

function MyApp() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppWithTheme />
      </ThemeProvider>
    </AuthProvider>
  );
}

// Séparons la logique du thème pour qu'il réagisse au contexte
function AppWithTheme() {
  const { darkMode, backgroundColor } = useContext(ThemeContext);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2'
      },
      secondary: {
        main: '#dc004e'
      },
      background: {
        default: darkMode ? '#121212' : backgroundColor // utilisation du backgroundColor du contexte
      }
    }
  });

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </MuiThemeProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <MyApp />
  </React.StrictMode>
);

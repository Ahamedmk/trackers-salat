// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { ThemeProvider } from './context/ThemeContext'; // Notre contexte de theme
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';

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
import { ThemeContext } from './context/ThemeContext';
import { useContext } from 'react';

function AppWithTheme() {
  const { darkMode } = useContext(ThemeContext);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light', 
      primary: {
        main: '#1976d2'
      },
      secondary: {
        main: '#dc004e'
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

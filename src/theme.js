// src/theme.js

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    background: {
      default: '#F2FFF2', // Vert pastel très clair (vous pouvez ajuster)
    },
    primary: {
      main: '#4CAF50', // Vert principal
    },
    secondary: {
      main: '#009688', // Un autre vert
    },
  },
  // Optionnel : Personnaliser la typographie, breakpoints, etc.
});

export default theme;

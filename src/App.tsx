import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import ShortenerPage from './components/ShortenerPage';
import StatsPage from './components/StatsPage';
import RedirectHandler from './components/RedirectHandler';
import logger from './utils/logger';
import { StorageManager } from './utils/storage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AppBar position="static" sx={{ mb: 4 }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          URL Shortener
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            color={location.pathname === '/' ? 'secondary' : 'inherit'} 
            onClick={() => navigate('/')}
          >
            Shortener
          </Button>
          <Button 
            color={location.pathname === '/stats' ? 'secondary' : 'inherit'} 
            onClick={() => navigate('/stats')}
          >
            Statistics
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

function App() {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize logger from storage or prompt for credentials
        const initialized = logger.initializeFromStorage();
        if (initialized) {
          await logger.info('App', 'Application started with existing credentials');
        } else {
          await logger.info('App', 'Application started - credentials needed');
        }
        
        // Cleanup expired URLs on app start
        await StorageManager.cleanupExpiredURLs();
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initializeApp();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <Navigation />
          <Container maxWidth="lg">
            <Routes>
              <Route path="/" element={<ShortenerPage />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="/:shortcode" element={<RedirectHandler />} />
            </Routes>
          </Container>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;

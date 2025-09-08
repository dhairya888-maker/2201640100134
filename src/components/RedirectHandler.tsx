import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, Button, Paper } from '@mui/material';
import { Home, Launch } from '@mui/icons-material';
import { StorageManager } from '../utils/storage';
import { getUserLocation } from '../utils/storage';
import logger from '../utils/logger';

const RedirectHandler: React.FC = () => {
  const { shortcode } = useParams<{ shortcode: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'redirecting' | 'error' | 'expired'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [originalUrl, setOriginalUrl] = useState<string>('');

  useEffect(() => {
    const handleRedirect = async () => {
      if (!shortcode) {
        setStatus('error');
        setErrorMessage('Invalid shortcode provided');
        await logger.error('RedirectHandler', 'No shortcode provided in URL');
        return;
      }

      try {
        await logger.info('RedirectHandler', `Processing redirect for shortcode: ${shortcode}`);
        
        // Find the URL by shortcode
        const url = await StorageManager.getURLByShortcode(shortcode);
        
        if (!url) {
          setStatus('error');
          setErrorMessage('Short URL not found. It may have been deleted or never existed.');
          await logger.warn('RedirectHandler', `Shortcode not found: ${shortcode}`);
          return;
        }

        // Check if URL is expired
        if (StorageManager.isURLExpired(url)) {
          setStatus('expired');
          setErrorMessage('This short URL has expired.');
          await logger.warn('RedirectHandler', `Attempted access to expired shortcode: ${shortcode}`);
          return;
        }

        setOriginalUrl(url.originalUrl);
        setStatus('redirecting');

        // Get user location and referrer
        const location = await getUserLocation();
        const source = document.referrer || 'direct';

        // Record the click
        const clickRecorded = await StorageManager.recordClick(shortcode, source, location);
        
        if (clickRecorded) {
          await logger.info('RedirectHandler', `Click recorded for ${shortcode}: ${source} -> ${location}`);
        } else {
          await logger.error('RedirectHandler', `Failed to record click for ${shortcode}`);
        }

        // Small delay to show the redirecting message
        setTimeout(() => {
          window.location.href = url.originalUrl;
        }, 1500);

      } catch (error) {
        setStatus('error');
        setErrorMessage('An unexpected error occurred while processing the redirect.');
        await logger.error('RedirectHandler', `Error processing redirect: ${error}`);
      }
    };

    handleRedirect();
  }, [shortcode]);

  const handleGoHome = async () => {
    navigate('/');
    await logger.info('RedirectHandler', 'User navigated back to home page');
  };

  const handleDirectRedirect = async () => {
    if (originalUrl) {
      window.location.href = originalUrl;
      await logger.info('RedirectHandler', `User manually redirected to: ${originalUrl}`);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="60vh"
      gap={3}
    >
      <Paper elevation={3} sx={{ p: 4, maxWidth: 500, textAlign: 'center' }}>
        {status === 'loading' && (
          <>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Processing short URL...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Looking up /{shortcode}
            </Typography>
          </>
        )}

        {status === 'redirecting' && (
          <>
            <CircularProgress size={48} sx={{ mb: 2, color: 'success.main' }} />
            <Typography variant="h6" gutterBottom color="success.main">
              Redirecting...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Taking you to your destination
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                wordBreak: 'break-all',
                fontFamily: 'monospace',
                bgcolor: 'grey.100',
                p: 1,
                borderRadius: 1
              }}
            >
              {originalUrl}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleDirectRedirect}
                startIcon={<Launch />}
              >
                Go Now
              </Button>
            </Box>
          </>
        )}

        {status === 'error' && (
          <>
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Short URL Not Found
              </Typography>
              {errorMessage}
            </Alert>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              The short URL /{shortcode} could not be found. It may have been deleted or never existed.
            </Typography>
            <Button
              variant="contained"
              onClick={handleGoHome}
              startIcon={<Home />}
            >
              Go to Homepage
            </Button>
          </>
        )}

        {status === 'expired' && (
          <>
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Short URL Expired
              </Typography>
              {errorMessage}
            </Alert>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              The short URL /{shortcode} has passed its expiration date and is no longer valid.
            </Typography>
            <Button
              variant="contained"
              onClick={handleGoHome}
              startIcon={<Home />}
            >
              Create New Short URL
            </Button>
          </>
        )}
      </Paper>

      {(status === 'error' || status === 'expired') && (
        <Box textAlign="center">
          <Typography variant="body2" color="text.secondary">
            Need to create a new short URL?
          </Typography>
          <Button variant="text" onClick={handleGoHome}>
            Visit our URL Shortener
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default RedirectHandler;

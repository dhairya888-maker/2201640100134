import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Chip,
  IconButton,
  Collapse,
  Link,
} from '@mui/material';
import { Add, Remove, ContentCopy, Launch } from '@mui/icons-material';
import { StorageManager, ShortenedURL } from '../utils/storage';
import logger from '../utils/logger';

interface URLForm {
  id: string;
  originalUrl: string;
  customShortcode: string;
  validityMinutes: number;
  shortened?: ShortenedURL;
  error?: string;
}

const ShortenerPage: React.FC = () => {
  const [urlForms, setUrlForms] = useState<URLForm[]>([
    { id: '1', originalUrl: '', customShortcode: '', validityMinutes: 30 }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const addUrlForm = async () => {
    if (urlForms.length >= 5) {
      await logger.warn('ShortenerPage', 'Attempted to add more than 5 URL forms');
      return;
    }
    
    const newForm: URLForm = {
      id: Date.now().toString(),
      originalUrl: '',
      customShortcode: '',
      validityMinutes: 30
    };
    
    setUrlForms([...urlForms, newForm]);
    await logger.info('ShortenerPage', `Added new URL form. Total forms: ${urlForms.length + 1}`);
  };

  const removeUrlForm = async (id: string) => {
    if (urlForms.length <= 1) return;
    
    setUrlForms(urlForms.filter(form => form.id !== id));
    await logger.info('ShortenerPage', `Removed URL form. Total forms: ${urlForms.length - 1}`);
  };

  const updateUrlForm = (id: string, field: keyof URLForm, value: string | number | ShortenedURL) => {
    setUrlForms(urlForms.map(form => 
      form.id === id ? { ...form, [field]: value, error: undefined } : form
    ));
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const shortenUrl = async (formId: string) => {
    const form = urlForms.find(f => f.id === formId);
    if (!form) return;

    // Validation
    if (!form.originalUrl.trim()) {
      updateUrlForm(formId, 'error', 'Original URL is required');
      return;
    }

    if (!isValidUrl(form.originalUrl)) {
      updateUrlForm(formId, 'error', 'Please enter a valid URL');
      return;
    }

    if (form.validityMinutes < 1 || form.validityMinutes > 1440) {
      updateUrlForm(formId, 'error', 'Validity period must be between 1 and 1440 minutes');
      return;
    }

    setIsLoading(true);

    try {
      let shortcode = form.customShortcode.trim();
      
      // If custom shortcode provided, check if it exists
      if (shortcode) {
        if (await StorageManager.isShortcodeExists(shortcode)) {
          updateUrlForm(formId, 'error', 'Custom shortcode already exists');
          setIsLoading(false);
          return;
        }
      } else {
        // Generate unique shortcode
        shortcode = await StorageManager.generateUniqueShortcode();
      }

      const now = new Date();
      const expiresAt = new Date(now.getTime() + (form.validityMinutes * 60 * 1000));

      const shortenedUrl: ShortenedURL = {
        id: Date.now().toString(),
        shortcode,
        originalUrl: form.originalUrl,
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        validityMinutes: form.validityMinutes,
        clicks: []
      };

      await StorageManager.saveURL(shortenedUrl);
      updateUrlForm(formId, 'shortened', shortenedUrl);
      
      await logger.info('ShortenerPage', `Successfully shortened URL: ${form.originalUrl} -> ${shortcode}`);
    } catch (error) {
      updateUrlForm(formId, 'error', `Failed to shorten URL: ${error}`);
      await logger.error('ShortenerPage', `Failed to shorten URL: ${error}`);
    }

    setIsLoading(false);
  };

  const copyToClipboard = async (text: string, shortcode: string) => {
    try {
      await navigator.clipboard.writeText(text);
      await logger.info('ShortenerPage', `Copied short URL to clipboard: ${shortcode}`);
    } catch (error) {
      await logger.error('ShortenerPage', `Failed to copy to clipboard: ${error}`);
    }
  };

  const getShortUrl = (shortcode: string): string => {
    return `${window.location.origin}/${shortcode}`;
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        URL Shortener
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Shorten up to 5 URLs with custom shortcodes and validity periods.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {urlForms.map((form, index) => (
          <Box key={form.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    URL #{index + 1}
                  </Typography>
                  <Box>
                    {urlForms.length > 1 && (
                      <IconButton 
                        onClick={() => removeUrlForm(form.id)}
                        color="error"
                        size="small"
                      >
                        <Remove />
                      </IconButton>
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Original URL"
                    value={form.originalUrl}
                    onChange={(e) => updateUrlForm(form.id, 'originalUrl', e.target.value)}
                    placeholder="https://example.com/very-long-url"
                    error={!!form.error && form.error.includes('URL')}
                  />
                  
                  <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                    <TextField
                      fullWidth
                      label="Custom Shortcode (Optional)"
                      value={form.customShortcode}
                      onChange={(e) => updateUrlForm(form.id, 'customShortcode', e.target.value)}
                      placeholder="mycode123"
                      error={!!form.error && form.error.includes('shortcode')}
                    />
                    
                    <TextField
                      fullWidth
                      type="number"
                      label="Validity (minutes)"
                      value={form.validityMinutes}
                      onChange={(e) => updateUrlForm(form.id, 'validityMinutes', parseInt(e.target.value) || 30)}
                      inputProps={{ min: 1, max: 1440 }}
                      error={!!form.error && form.error.includes('Validity')}
                    />
                  </Box>
                  
                  <Button
                    variant="contained"
                    onClick={() => shortenUrl(form.id)}
                    disabled={isLoading || !form.originalUrl.trim()}
                    fullWidth
                  >
                    {isLoading ? 'Shortening...' : 'Shorten URL'}
                  </Button>
                </Box>

                {form.error && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {form.error}
                  </Alert>
                )}

                <Collapse in={!!form.shortened}>
                  {form.shortened && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                      <Typography variant="subtitle2" color="success.dark" gutterBottom>
                        URL Successfully Shortened!
                      </Typography>
                      
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography variant="body2" sx={{ wordBreak: 'break-all', flex: 1 }}>
                          <strong>Short URL:</strong> 
                          <Link 
                            href={getShortUrl(form.shortened.shortcode)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            sx={{ ml: 1 }}
                          >
                            {getShortUrl(form.shortened.shortcode)}
                          </Link>
                        </Typography>
                        <IconButton 
                          size="small" 
                          onClick={() => copyToClipboard(getShortUrl(form.shortened!.shortcode), form.shortened!.shortcode)}
                        >
                          <ContentCopy fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          href={getShortUrl(form.shortened.shortcode)}
                          target="_blank"
                        >
                          <Launch fontSize="small" />
                        </IconButton>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary">
                        <strong>Expires:</strong> {new Date(form.shortened.expiresAt).toLocaleString()}
                      </Typography>
                      
                      <Chip 
                        label={`Shortcode: ${form.shortened.shortcode}`}
                        size="small" 
                        color="primary" 
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  )}
                </Collapse>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {urlForms.length < 5 && (
        <Box mt={3} display="flex" justifyContent="center">
          <Button
            variant="outlined"
            onClick={addUrlForm}
            startIcon={<Add />}
          >
            Add Another URL ({urlForms.length}/5)
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ShortenerPage;

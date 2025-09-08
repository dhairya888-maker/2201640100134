import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Alert,
  Link,
  IconButton,
} from '@mui/material';
import {
  ExpandMore,
  Launch,
  ContentCopy,
  Refresh,
} from '@mui/icons-material';
import { StorageManager, ShortenedURL, ClickData } from '../utils/storage';
import logger from '../utils/logger';

const StatsPage: React.FC = () => {
  const [urls, setUrls] = useState<ShortenedURL[]>([]);
  const [stats, setStats] = useState({ totalUrls: 0, totalClicks: 0, activeUrls: 0 });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      await StorageManager.cleanupExpiredURLs();
      const allUrls = StorageManager.getAllURLs();
      const currentStats = await StorageManager.getStats();
      
      setUrls(allUrls);
      setStats(currentStats);
      
      await logger.info('StatsPage', `Loaded ${allUrls.length} URLs with ${currentStats.totalClicks} total clicks`);
    } catch (error) {
      await logger.error('StatsPage', `Failed to load data: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const copyToClipboard = async (text: string, shortcode: string) => {
    try {
      await navigator.clipboard.writeText(text);
      await logger.info('StatsPage', `Copied short URL to clipboard: ${shortcode}`);
    } catch (error) {
      await logger.error('StatsPage', `Failed to copy to clipboard: ${error}`);
    }
  };

  const getShortUrl = (shortcode: string): string => {
    return `${window.location.origin}/${shortcode}`;
  };

  const isExpired = (url: ShortenedURL): boolean => {
    return StorageManager.isURLExpired(url);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  const renderClickDetails = (clicks: ClickData[]) => {
    if (clicks.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          No clicks recorded yet
        </Typography>
      );
    }

    return (
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Location</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clicks.map((click, index) => (
              <TableRow key={index}>
                <TableCell>{formatDate(click.timestamp)}</TableCell>
                <TableCell>
                  <Chip 
                    label={click.source} 
                    size="small" 
                    variant="outlined"
                    color={click.source === 'direct' ? 'primary' : 'secondary'}
                  />
                </TableCell>
                <TableCell>{click.location}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography>Loading statistics...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          URL Statistics
        </Typography>
        <Button
          variant="outlined"
          onClick={loadData}
          startIcon={<Refresh />}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Summary Stats */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 4 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total URLs
            </Typography>
            <Typography variant="h4" component="div">
              {stats.totalUrls}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Clicks
            </Typography>
            <Typography variant="h4" component="div">
              {stats.totalClicks}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Active URLs
            </Typography>
            <Typography variant="h4" component="div">
              {stats.activeUrls}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* URL List */}
      {urls.length === 0 ? (
        <Alert severity="info">
          No shortened URLs found. Visit the <Link href="/">Shortener page</Link> to create some!
        </Alert>
      ) : (
        <Box>
          <Typography variant="h5" component="h2" gutterBottom>
            All Shortened URLs
          </Typography>
          
          {urls.map((url) => (
            <Accordion key={url.id} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      /{url.shortcode}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ 
                      wordBreak: 'break-all',
                      maxWidth: '300px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {url.originalUrl}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={`${url.clicks.length} clicks`}
                      size="small"
                      color="primary"
                    />
                    <Chip
                      label={isExpired(url) ? 'Expired' : 'Active'}
                      size="small"
                      color={isExpired(url) ? 'error' : 'success'}
                    />
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                  <Box sx={{ flex: 1 }}>
                    <Box mb={2}>
                      <Typography variant="subtitle2" gutterBottom>
                        URL Details
                      </Typography>
                      <Box sx={{ pl: 2 }}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <Typography variant="body2">
                            <strong>Short URL:</strong> 
                            <Link 
                              href={getShortUrl(url.shortcode)} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              sx={{ ml: 1 }}
                            >
                              {getShortUrl(url.shortcode)}
                            </Link>
                          </Typography>
                          <IconButton 
                            size="small" 
                            onClick={() => copyToClipboard(getShortUrl(url.shortcode), url.shortcode)}
                          >
                            <ContentCopy fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            href={getShortUrl(url.shortcode)}
                            target="_blank"
                          >
                            <Launch fontSize="small" />
                          </IconButton>
                        </Box>
                        <Typography variant="body2">
                          <strong>Original URL:</strong> 
                          <Link 
                            href={url.originalUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            sx={{ ml: 1, wordBreak: 'break-all' }}
                          >
                            {url.originalUrl}
                          </Link>
                        </Typography>
                        <Typography variant="body2">
                          <strong>Created:</strong> {formatDate(url.createdAt)}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Expires:</strong> {formatDate(url.expiresAt)}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Validity Period:</strong> {url.validityMinutes} minutes
                        </Typography>
                        <Typography variant="body2">
                          <strong>Status:</strong>{' '}
                          <Chip
                            label={isExpired(url) ? 'Expired' : 'Active'}
                            size="small"
                            color={isExpired(url) ? 'error' : 'success'}
                          />
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Click Statistics ({url.clicks.length} total)
                    </Typography>
                    {renderClickDetails(url.clicks)}
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default StatsPage;

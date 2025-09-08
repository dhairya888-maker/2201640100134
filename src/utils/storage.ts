import logger from './logger';

export interface ClickData {
  timestamp: string;
  source: string;
  location: string;
}

export interface ShortenedURL {
  id: string;
  shortcode: string;
  originalUrl: string;
  createdAt: string;
  expiresAt: string;
  validityMinutes: number;
  clicks: ClickData[];
}

const STORAGE_KEY = 'url_shortener_data';

export class StorageManager {
  private static async logOperation(operation: string, details: string): Promise<void> {
    await logger.info('StorageManager', `${operation}: ${details}`);
  }

  static async saveURL(url: ShortenedURL): Promise<void> {
    try {
      const existingUrls = this.getAllURLs();
      const updatedUrls = [...existingUrls.filter(u => u.id !== url.id), url];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUrls));
      await this.logOperation('saveURL', `Saved URL with shortcode: ${url.shortcode}`);
    } catch (error) {
      await logger.error('StorageManager', `Failed to save URL: ${error}`);
      throw error;
    }
  }

  static getAllURLs(): ShortenedURL[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      logger.error('StorageManager', `Failed to get all URLs: ${error}`);
      return [];
    }
  }

  static async getURLByShortcode(shortcode: string): Promise<ShortenedURL | null> {
    try {
      const urls = this.getAllURLs();
      const url = urls.find(u => u.shortcode === shortcode) || null;
      await this.logOperation('getURLByShortcode', `Searched for shortcode: ${shortcode}, found: ${!!url}`);
      return url;
    } catch (error) {
      await logger.error('StorageManager', `Failed to get URL by shortcode: ${error}`);
      return null;
    }
  }

  static async isShortcodeExists(shortcode: string): Promise<boolean> {
    const url = await this.getURLByShortcode(shortcode);
    return !!url;
  }

  static isURLExpired(url: ShortenedURL): boolean {
    return new Date() > new Date(url.expiresAt);
  }

  static async recordClick(shortcode: string, source: string, location: string): Promise<boolean> {
    try {
      const url = await this.getURLByShortcode(shortcode);
      if (!url) {
        await logger.warn('StorageManager', `Attempted to record click for non-existent shortcode: ${shortcode}`);
        return false;
      }

      if (this.isURLExpired(url)) {
        await logger.warn('StorageManager', `Attempted to record click for expired shortcode: ${shortcode}`);
        return false;
      }

      const clickData: ClickData = {
        timestamp: new Date().toISOString(),
        source: source || 'direct',
        location: location || 'unknown'
      };

      url.clicks.push(clickData);
      await this.saveURL(url);
      await this.logOperation('recordClick', `Recorded click for ${shortcode} from ${source}`);
      return true;
    } catch (error) {
      await logger.error('StorageManager', `Failed to record click: ${error}`);
      return false;
    }
  }

  static generateShortcode(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static async generateUniqueShortcode(): Promise<string> {
    let shortcode = this.generateShortcode();
    let attempts = 0;
    const maxAttempts = 10;

    while (await this.isShortcodeExists(shortcode) && attempts < maxAttempts) {
      shortcode = this.generateShortcode();
      attempts++;
    }

    if (attempts >= maxAttempts) {
      throw new Error('Failed to generate unique shortcode after maximum attempts');
    }

    return shortcode;
  }

  static async cleanupExpiredURLs(): Promise<void> {
    try {
      const urls = this.getAllURLs();
      const validUrls = urls.filter(url => !this.isURLExpired(url));
      const expiredCount = urls.length - validUrls.length;
      
      if (expiredCount > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(validUrls));
        await this.logOperation('cleanupExpiredURLs', `Cleaned up ${expiredCount} expired URLs`);
      }
    } catch (error) {
      await logger.error('StorageManager', `Failed to cleanup expired URLs: ${error}`);
    }
  }

  static async getStats(): Promise<{ totalUrls: number; totalClicks: number; activeUrls: number }> {
    try {
      const urls = this.getAllURLs();
      const activeUrls = urls.filter(url => !this.isURLExpired(url)).length;
      const totalClicks = urls.reduce((sum, url) => sum + url.clicks.length, 0);
      
      const stats = {
        totalUrls: urls.length,
        totalClicks,
        activeUrls
      };

      await this.logOperation('getStats', `Retrieved stats: ${JSON.stringify(stats)}`);
      return stats;
    } catch (error) {
      await logger.error('StorageManager', `Failed to get stats: ${error}`);
      return { totalUrls: 0, totalClicks: 0, activeUrls: 0 };
    }
  }
}

// Utility function to get user location (simplified)
export const getUserLocation = async (): Promise<string> => {
  try {
    // In a real application, you might use a geolocation API
    // For now, we'll use a simple approach with the timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return timezone || 'unknown';
  } catch (error) {
    await logger.warn('getUserLocation', `Failed to get user location: ${error}`);
    return 'unknown';
  }
};

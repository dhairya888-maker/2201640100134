interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface LogPayload {
  level: 'info' | 'warn' | 'error' | 'debug';
  package: string;
  message: string;
}

class Logger {
  private static instance: Logger;
  private clientId: string | null = null;
  private clientSecret: string | null = null;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;
  private baseUrl: string = 'https://api.test-server.com'; // Replace with actual server URL

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  // Manual registration method - call this first to get clientID and clientSecret
  public async register(username: string, email: string): Promise<{ clientId: string; clientSecret: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email }),
      });

      if (!response.ok) {
        throw new Error(`Registration failed: ${response.statusText}`);
      }

      const data = await response.json();
      this.clientId = data.clientId;
      this.clientSecret = data.clientSecret;
      
      // Store credentials in localStorage for persistence
      if (this.clientId && this.clientSecret) {
        localStorage.setItem('logger_clientId', this.clientId);
        localStorage.setItem('logger_clientSecret', this.clientSecret);
      }

      return { clientId: this.clientId!, clientSecret: this.clientSecret! };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Initialize with stored credentials
  public initializeFromStorage(): boolean {
    this.clientId = localStorage.getItem('logger_clientId');
    this.clientSecret = localStorage.getItem('logger_clientSecret');
    return !!(this.clientId && this.clientSecret);
  }

  // Set credentials manually if already obtained
  public setCredentials(clientId: string, clientSecret: string): void {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    localStorage.setItem('logger_clientId', clientId);
    localStorage.setItem('logger_clientSecret', clientSecret);
  }

  private async getAccessToken(): Promise<string> {
    if (!this.clientId || !this.clientSecret) {
      throw new Error('Client credentials not set. Please register first.');
    }

    // Check if current token is still valid
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const authData: AuthResponse = await response.json();
      this.accessToken = authData.access_token;
      this.tokenExpiry = Date.now() + (authData.expires_in * 1000) - 60000; // Subtract 1 minute for buffer

      return this.accessToken;
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }

  private async sendLog(logData: LogPayload): Promise<void> {
    try {
      const token = await this.getAccessToken();
      
      const response = await fetch(`${this.baseUrl}/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...logData,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Log submission failed: ${response.statusText}`);
      }
    } catch (error) {
      // Fallback to console.log if remote logging fails
      console.error('Failed to send log to server:', error);
      console.log(`[${logData.level.toUpperCase()}] ${logData.package}: ${logData.message}`);
    }
  }

  public async log(level: LogPayload['level'], packageName: string, message: string): Promise<void> {
    await this.sendLog({ level, package: packageName, message });
  }

  public async info(packageName: string, message: string): Promise<void> {
    await this.log('info', packageName, message);
  }

  public async warn(packageName: string, message: string): Promise<void> {
    await this.log('warn', packageName, message);
  }

  public async error(packageName: string, message: string): Promise<void> {
    await this.log('error', packageName, message);
  }

  public async debug(packageName: string, message: string): Promise<void> {
    await this.log('debug', packageName, message);
  }
}

export default Logger.getInstance();

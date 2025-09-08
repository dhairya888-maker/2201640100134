# API-Based Logging Middleware

This middleware provides a reusable logging system that connects to a remote test server with authentication.

## Features

- Automatic authentication with Bearer token management
- Token refresh when expired
- Fallback to console logging if remote logging fails
- Singleton pattern for consistent usage across the application
- localStorage persistence for credentials

## Setup

1. First, manually register to get your client credentials:
   ```typescript
   import logger from './logger';
   
   const credentials = await logger.register('username', 'email@example.com');
   console.log('Client ID:', credentials.clientId);
   console.log('Client Secret:', credentials.clientSecret);
   ```

2. Or set credentials manually if you already have them:
   ```typescript
   logger.setCredentials('your-client-id', 'your-client-secret');
   ```

3. Or initialize from previously stored credentials:
   ```typescript
   const initialized = logger.initializeFromStorage();
   if (!initialized) {
     // Need to register or set credentials
   }
   ```

## Usage

Replace all `console.log` calls with the appropriate logger method:

```typescript
import logger from './logger';

// Different log levels
await logger.info('package-name', 'Information message');
await logger.warn('package-name', 'Warning message');
await logger.error('package-name', 'Error message');
await logger.debug('package-name', 'Debug message');

// Or use the generic log method
await logger.log('info', 'package-name', 'Custom message');
```

## API Endpoints

- `POST /register` - Register to get client credentials
- `POST /auth` - Get Bearer access token
- `POST /logs` - Submit log entries (requires Bearer token)

## Configuration

Update the `baseUrl` in the Logger class to point to your actual test server URL.

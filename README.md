# URL Shortener - Client-Side Application

A React TypeScript application for shortening URLs with click tracking and analytics.

## 🚀 Features

### Core Functionality
- **Multi-URL Shortening**: Handle up to 5 URLs simultaneously
- **Custom Shortcodes**: Optional user-defined shortcodes with collision detection
- **Expiration Control**: Configurable validity periods (1-1440 minutes)
- **Click Tracking**: Record clicks with timestamp, source, and location data
- **Statistics Dashboard**: View URL analytics and click details
- **Responsive Design**: Mobile-friendly interface with Material UI

### Technical Features
- **Client-Side Only**: No server required - uses localStorage for persistence
- **TypeScript**: Type-safe development with comprehensive interfaces
- **Material UI**: Professional, accessible component library
- **API Logging**: Integrated remote logging system with authentication
- **Error Handling**: Graceful error handling with user-friendly messages

## 🏗️ Project Structure

```
URLShortener/
├── LoggingMiddleware/          # Standalone logging module
│   ├── logger.ts              # API-based logging implementation
│   ├── package.json           # NPM package configuration
│   └── README.md              # Logging middleware documentation
└── FrontendTestSubmission/
    └── url-shortener/         # React application
        ├── public/            # Static files
        ├── src/
        │   ├── components/    # React components
        │   │   ├── ShortenerPage.tsx    # Main URL shortener form
        │   │   ├── StatsPage.tsx        # Analytics dashboard
        │   │   └── RedirectHandler.tsx  # Shortcode redirection logic
        │   ├── utils/         # Utility functions
        │   │   ├── logger.ts  # Logging middleware integration
        │   │   └── storage.ts # localStorage management
        │   └── App.tsx        # Main application with routing
        ├── build/             # Production build output
        ├── DESIGN.md          # Technical design document
        └── README.md          # This file
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation Steps

1. **Clone/Download the project**
   ```bash
   cd https://github.com/dhairya888-maker/2201640100134
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```
   
   The application will open at `http://localhost:3000`

4. **Build for production**
   ```bash
   npm run build
   ```

## 📱 Usage Guide

### 1. Shortening URLs

1. Navigate to the home page (`/`)
2. Enter your long URL in the "Original URL" field
3. (Optional) Provide a custom shortcode
4. Set the validity period in minutes (default: 30)
5. Click "Shorten URL"
6. Copy the generated short URL and share it

**Features:**
- Shorten up to 5 URLs at once
- Custom shortcodes must be unique
- URLs expire automatically based on validity period
- Real-time validation and error messages

### 2. Viewing Statistics

1. Navigate to the Statistics page (`/stats`)
2. View summary metrics: Total URLs, Total Clicks, Active URLs
3. Expand any URL entry to see detailed information:
   - Short URL and original URL
   - Creation and expiration dates
   - Click history with timestamps
   - Source and location data for each click

### 3. Using Short URLs

- When someone visits a short URL (e.g., `localhost:3000/abc123`):
  - The system validates the shortcode
  - Records the click with metadata
  - Redirects to the original URL
  - Shows error page if URL is expired or invalid

## 🔧 API Logging Setup

The application includes an API-based logging system:

### Initial Setup
1. **Register for credentials** (one-time setup):
   ```javascript
   import logger from './utils/logger';
   
   // Register to get client credentials
   const credentials = await logger.register('username', 'email@example.com');
   console.log(credentials); // Save these credentials
   ```

2. **Set credentials manually**:
   ```javascript
   logger.setCredentials('your-client-id', 'your-client-secret');
   ```

### Configuration
- Update the `baseUrl` in `src/utils/logger.ts` to point to your logging server
- The system automatically handles authentication and token refresh
- Falls back to console logging if remote logging fails

## 🏃‍♂️ Available Scripts

- **`npm start`**: Runs the development server
- **`npm run build`**: Creates optimized production build
- **`npm test`**: Runs test suite
- **`npm run eject`**: Ejects from Create React App (irreversible)

## 💾 Data Storage

- **Client-Side Only**: All data stored in browser localStorage
- **Automatic Cleanup**: Expired URLs are cleaned up automatically
- **Data Structure**: Comprehensive tracking with timestamps and metadata
- **Persistence**: Data persists across browser sessions
- **Privacy**: No data sent to external servers (except optional logging)

## 📊 Browser Compatibility

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **JavaScript**: ES2017+ features used
- **Storage**: localStorage API required
- **APIs**: Fetch API, Clipboard API (for copy functionality)

## 🔒 Security Features

- **Input Validation**: URL format validation and sanitization
- **XSS Protection**: React JSX automatic escaping
- **Type Safety**: TypeScript prevents runtime type errors
- **Data Integrity**: Atomic localStorage operations
- **Error Boundaries**: Graceful error handling

## 🚀 Production Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Deploy the `build` folder** to any static hosting service:
   - Netlify, Vercel, GitHub Pages
   - Apache, Nginx web servers
   - CDN services

3. **Configure routing** (for single-page application):
   - Ensure all routes redirect to `index.html`
   - Configure 404 fallback to handle shortcode routes

## 🔄 Future Enhancements

- **Backend Integration**: Database persistence with REST API
- **User Authentication**: Multi-user support with accounts
- **Advanced Analytics**: Charts, graphs, and detailed metrics
- **Bulk Operations**: Import/export URL lists
- **Custom Domains**: Branded short domains support
- **QR Code Generation**: Generate QR codes for short URLs
- **Link Preview**: Show preview of destination URLs

## 📋 Technical Specifications

- **Framework**: React 18 with TypeScript
- **UI Library**: Material UI (MUI) v5
- **Routing**: React Router DOM v6
- **Build Tool**: Create React App
- **Storage**: Browser localStorage API
- **Authentication**: Bearer token with automatic refresh
- **Responsive**: Mobile-first design approach

## 🐛 Troubleshooting

### Common Issues

1. **Build fails with TypeScript errors**:
   - Ensure all dependencies are installed: `npm install`
   - Check TypeScript version compatibility

2. **Logging not working**:
   - Verify API server URL in logger configuration
   - Check client credentials are set correctly
   - Review browser network tab for API errors

3. **Short URLs not working**:
   - Ensure React Router is handling all routes
   - Check localStorage has data for the shortcode
   - Verify URL hasn't expired

4. **Responsive issues**:
   - Clear browser cache and refresh
   - Check Material UI theme configuration

## 📄 License

This project is for educational/demonstration purposes. Refer to the individual package licenses for dependencies.

---

**Built with ❤️ using React, TypeScript, and Material UI**

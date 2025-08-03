# Google OAuth 2.0 Setup for Discussion Forum

This guide explains how to set up Google OAuth 2.0 for the discussion forum authentication.

## 🚀 Features Implemented

- **Google OAuth 2.0 Integration**: Users can sign in with their Google accounts
- **Guest Mode**: Users can continue as anonymous guests
- **Pseudonym System**: First-time Google users can set a display name
- **Persistent Authentication**: User sessions are saved locally
- **Discussion Integration**: Comments show user pseudonyms or "Anonymous"

## 📋 Prerequisites

1. **Google Cloud Console Account**: You need a Google account to create OAuth credentials
2. **Node.js**: Version 14 or higher
3. **npm**: For package management

## 🔧 Setup Instructions

### 1. Google Cloud Console Setup

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Create a new project or select an existing one

2. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
   - Also enable "Google OAuth2 API"

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Set the following:
     - **Name**: Professor Portfolio Discussion Forum
     - **Authorized JavaScript origins**: `http://localhost:3000`
     - **Authorized redirect URIs**: `http://localhost:5000/api/auth/google/callback`

4. **Copy Credentials**
   - Note down your **Client ID** and **Client Secret**
   - You'll need these for the environment variables

### 2. Environment Configuration

1. **Copy Environment Template**
   ```bash
   cp env.example .env
   ```

2. **Edit .env File**
   ```env
   # Frontend Configuration
   REACT_APP_BACKEND_URI=http://localhost:5000
   REACT_APP_FRONTEND_URL=http://localhost:3000

   # Backend Configuration
   PORT=5000
   NODE_ENV=development

   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
   ```

3. **Replace Placeholder Values**
   - Replace `your_google_client_id_here` with your actual Google Client ID
   - Replace `your_google_client_secret_here` with your actual Google Client Secret

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Application

**Option 1: Run Both Frontend and Backend Together**
```bash
npm run dev
```

**Option 2: Run Separately**
```bash
# Terminal 1 - Backend Server
npm run server

# Terminal 2 - Frontend
npm start
```

### 5. Test the Implementation

1. **Navigate to Course Discussions**
   - Go to any course page
   - Click on "Discussions"
   - You should see the discussion topics

2. **Test Authentication**
   - Click "Join Discussion" button
   - Choose "Sign in with Google" or "Continue as Guest"
   - If using Google, complete the OAuth flow
   - For first-time Google users, set a pseudonym

3. **Test Commenting**
   - Click on a discussion topic
   - Add a comment
   - Verify your pseudonym appears correctly

## 🎯 User Flow

### Google OAuth Flow
1. User clicks "Join Discussion"
2. User chooses "Sign in with Google"
3. Google OAuth popup opens
4. User authorizes the application
5. If first-time user: Set pseudonym
6. If returning user: Use existing pseudonym
7. User can now comment with their pseudonym

### Guest Flow
1. User clicks "Join Discussion"
2. User chooses "Continue as Guest"
3. User is immediately authenticated as "Anonymous"
4. User can comment anonymously

## 🔒 Security Features

- **OAuth 2.0**: Secure Google authentication
- **Pseudonym System**: Users can choose display names
- **Guest Mode**: Anonymous participation option
- **Local Storage**: Session persistence
- **CORS Protection**: Backend configured for frontend origin

## 🐛 Troubleshooting

### Common Issues

1. **"Invalid Client ID" Error**
   - Verify your Google Client ID is correct in `.env`
   - Check that the redirect URI matches exactly

2. **"Redirect URI Mismatch" Error**
   - Ensure the redirect URI in Google Console matches your `.env` file
   - Should be: `http://localhost:5000/api/auth/google/callback`

3. **"CORS Error"**
   - Check that `REACT_APP_FRONTEND_URL` is set correctly
   - Ensure backend is running on port 5000

4. **"Authentication Failed"**
   - Check browser console for detailed error messages
   - Verify Google OAuth credentials are correct

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run dev
```

## 📁 File Structure

```
professor-portfolio/
├── src/
│   ├── components/
│   │   ├── GoogleAuth.js          # OAuth component
│   │   ├── DiscussionTopics.js    # Updated with auth
│   │   └── DiscussionComments.js  # Updated with auth
├── server.js                      # Backend server
├── package.json                   # Dependencies
├── env.example                    # Environment template
└── GOOGLE_OAUTH_SETUP.md         # This file
```

## 🚀 Production Deployment

### Environment Variables for Production

```env
NODE_ENV=production
REACT_APP_BACKEND_URI=https://your-domain.com
REACT_APP_FRONTEND_URL=https://your-domain.com
GOOGLE_CLIENT_ID=your_production_client_id
GOOGLE_CLIENT_SECRET=your_production_client_secret
GOOGLE_REDIRECT_URI=https://your-domain.com/api/auth/google/callback
```

### Google Cloud Console Updates

1. **Update Authorized Origins**
   - Add your production domain to JavaScript origins
   - Example: `https://your-domain.com`

2. **Update Redirect URIs**
   - Add your production callback URL
   - Example: `https://your-domain.com/api/auth/google/callback`

### Database Integration

For production, replace the in-memory user storage with a database:

```javascript
// Example with MongoDB
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  googleId: String,
  name: String,
  email: String,
  pseudonym: String,
  createdAt: Date
});

const User = mongoose.model('User', UserSchema);
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. 
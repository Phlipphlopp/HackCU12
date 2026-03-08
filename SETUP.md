# Setup Instructions

## Prerequisites

Before starting, you'll need:
1. Node.js (v18 or higher)
2. A Google Gemini API key with access to:
   - Gemini text generation models
   - Veo 3.1 video generation model

## Getting a Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create or select a project
4. Click "Create API Key"
5. Copy the generated API key
6. Ensure your API key has access to both text generation and Veo 3.1 video generation

## Installing Node.js

This project requires Node.js to run. Follow these steps to install it:

### Windows

1. **Download Node.js**
   - Visit https://nodejs.org/
   - Download the LTS (Long Term Support) version
   - Run the installer (.msi file)

2. **Verify Installation**
   ```cmd
   node --version
   npm --version
   ```

### After Installing Node.js

1. **Navigate to the project directory**
   ```cmd
   cd ai-script-generator
   ```

2. **Configure environment variables**
   ```cmd
   copy .env.example .env
   ```
   Then edit the `.env` file and replace `your_api_key_here` with your actual Gemini API key.

   **Optional Video Generation Settings:**
   - `REACT_APP_VIDEO_ASPECT_RATIO`: Choose video aspect ratio
     - `16:9` - Landscape (default, best for YouTube, presentations)
     - `9:16` - Portrait (best for mobile, TikTok, Instagram Stories)
     - `1:1` - Square (best for Instagram posts)
   - `REACT_APP_VIDEO_QUALITY`: Choose video quality
     - `standard` - Faster generation, smaller file size (default)
     - `high` - Better quality, longer generation time
   - `REACT_APP_VIDEO_TIMEOUT`: Maximum wait time in milliseconds (default: 300000 = 5 minutes)

3. **Install dependencies**
   ```cmd
   npm install
   ```

4. **Run the development server**
   ```cmd
   npm start
   ```
   The application will open in your browser at http://localhost:3000

5. **Run tests**
   ```cmd
   npm test
   ```

## Project Structure Created

The following structure has been set up:

```
ai-script-generator/
├── public/
│   └── index.html              # HTML template
├── src/
│   ├── components/             # React components (empty, ready for implementation)
│   ├── services/               # Service layer (empty, ready for implementation)
│   ├── types/                  # TypeScript types (empty, ready for implementation)
│   ├── test-utils/             # Testing utilities (empty, ready for implementation)
│   ├── App.tsx                 # Main application component
│   ├── App.test.tsx            # Basic test example
│   ├── index.tsx               # Application entry point
│   └── setupTests.ts           # Jest configuration
├── .gitignore                  # Git ignore rules
├── jest.config.js              # Jest configuration
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── README.md                   # Project documentation
└── SETUP.md                    # This file
```

## Dependencies Configured

### Production Dependencies
- react ^18.2.0
- react-dom ^18.2.0
- typescript ^5.0.0

### Development Dependencies
- @testing-library/jest-dom ^6.1.5
- @testing-library/react ^14.1.2
- @testing-library/user-event ^14.5.1
- @types/jest ^29.5.11
- @types/node ^20.10.6
- @types/react ^18.2.46
- @types/react-dom ^18.2.18
- fast-check ^3.15.0 (property-based testing)
- jest ^29.7.0
- jest-environment-jsdom ^29.7.0
- ts-jest ^29.1.1
- ts-node ^10.9.2

## Next Steps

After installing Node.js, configuring your API key, and running `npm install`, you can proceed with implementing the remaining tasks from the implementation plan:

1. Task 2: Implement core data models and types
2. Task 3: Implement input validation service
3. And so on...

Each task builds incrementally on the previous ones.

## Video Generation Notes

- **First-time use**: Video generation may take 2-5 minutes depending on script complexity
- **API Quotas**: Be aware of your Gemini API quotas for video generation
- **Content Policy**: Scripts must comply with Google's content policies
- **Video Storage**: Generated videos are temporarily hosted - download them promptly
- **Troubleshooting**: If video generation fails, check:
  - Your API key has Veo 3.1 access
  - You haven't exceeded API rate limits
  - Your script complies with content policies
  - Your network connection is stable

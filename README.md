# AI Script Generator

A web application for creating video scripts through AI assistance.

## Features

- **Basic Mode**: Simple prompt input for quick script generation
- **Advanced Mode**: Structured inputs for detailed story elements (plot lines, characters, genre, content type)
- **Script Review**: Approve or reject generated scripts
- **Video Generation**: Generate videos from approved scripts using Google's Veo 3.1 model
- **Video Download**: Download generated videos in MP4 format
- **Input Validation**: Comprehensive validation with helpful error messages

## Project Structure

```
ai-script-generator/
├── src/
│   ├── components/     # React UI components
│   ├── services/       # Business logic and API integration
│   ├── types/          # TypeScript type definitions
│   ├── test-utils/     # Testing utilities and generators
│   ├── App.tsx         # Main application component
│   ├── index.tsx       # Application entry point
│   └── setupTests.ts   # Jest configuration
├── public/             # Static assets
└── package.json        # Project dependencies
```

## Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Google Gemini API key with access to:
  - Gemini text generation models (e.g., gemini-2.5-flash)
  - Veo 3.1 video generation model

### API Configuration

1. **Get a Gemini API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create or select a project
   - Generate an API key
   - Ensure your API key has access to both text generation and Veo 3.1 video generation

2. **Configure Environment Variables**
   - Copy `.env.example` to `.env`
   - Replace `your_api_key_here` with your actual Gemini API key
   - Optionally configure video generation settings:
     - `REACT_APP_VIDEO_ASPECT_RATIO`: Set to `16:9` (landscape), `9:16` (portrait), or `1:1` (square)
     - `REACT_APP_VIDEO_QUALITY`: Set to `standard` or `high`
     - `REACT_APP_VIDEO_TIMEOUT`: Maximum wait time for video generation in milliseconds

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build for production
npm run build
```

### Video Generation Requirements

The video generation feature uses Google's Veo 3.1 model through the Gemini API:

- **API Access**: Your Gemini API key must have access to the Veo 3.1 model
- **Quotas**: Video generation is subject to API quotas and rate limits
- **Processing Time**: Video generation typically takes 2-5 minutes depending on script complexity
- **Video Format**: Generated videos are provided in MP4 format
- **Temporary Storage**: Generated video URLs are temporary and should be downloaded promptly
- **Content Policy**: Scripts must comply with Google's content policies for video generation

## Testing

This project uses a dual testing approach:

- **Unit Tests**: Jest and React Testing Library for component and integration testing
- **Property-Based Tests**: fast-check for testing universal properties across all inputs

Each property-based test runs a minimum of 100 iterations with randomly generated inputs.

## Technology Stack

- React 18
- TypeScript 5
- Jest 29
- React Testing Library 14
- fast-check 3 (property-based testing)

## Development

The application follows a structured development approach based on formal requirements and design specifications. See the `.kiro/specs/ai-script-generator/` directory for detailed requirements, design, and implementation tasks.

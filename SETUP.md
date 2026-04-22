# Setup Guide

## Development with Docker Compose

```bash
# Make sure .env exists with your API key
cat .env
# Should show: GEMINI_API_KEY=your_key_here

# Start both frontend and backend
docker-compose up
```

Then visit:
- **Frontend**: http://localhost:3000 (Vite dev server with hot reload)
- **Backend**: http://localhost:5006 (API server)

## Local Development (without Docker)

```bash
# Terminal 1: Start backend
npm run backend

# Terminal 2: Start frontend
npm run dev
```

## Production Build

```bash
# Build the production image
docker build -t react-component-generator .

# Run with API key
docker run -e GEMINI_API_KEY=your_key -p 5006:5006 react-component-generator

# Visit: http://localhost:5006
```

## How It Works

1. **Frontend** (React on port 3000)
   - Runs Vite dev server with hot reload
   - Calls `/api/generate` for component generation

2. **Backend** (Node.js on port 5006)
   - Handles `/api/generate` requests
   - Uses `GEMINI_API_KEY` to call Google Gemini API
   - Serves built frontend in production

## Why One Dockerfile?

- **Dockerfile** = Production-ready image (builds frontend + backend in one container)
- **docker-compose.yml** = Development setup (separate frontend dev server + backend)

No `VITE_GEMINI_API_KEY` needed - frontend calls backend API instead!

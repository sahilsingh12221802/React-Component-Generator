# Step 1: Build React frontend
FROM node:22-alpine AS frontend-build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY src ./src
COPY public ./public
COPY vite.config.js index.html eslint.config.js ./
RUN npm run build

# Step 2: Backend + Frontend runtime
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

# Copy backend server code
COPY backend ./backend

# Copy built frontend files (React app will be served as static files)
COPY --from=frontend-build /app/dist ./dist

EXPOSE 5006

# Backend serves:
# - POST /api/generate -> Calls Gemini API
# - GET /* -> Serves React frontend (static files + SPA routing)
#
# Note: GEMINI_API_KEY must be passed at runtime using -e flag
# Example: docker run -e GEMINI_API_KEY=your_key_here -p 5006:5006 image_name
CMD ["node", "backend/server.js"]
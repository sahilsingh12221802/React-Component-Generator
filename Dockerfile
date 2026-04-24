# Step 1: Build frontend
FROM node:22-alpine AS frontend-build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


# Step 2: Backend runtime
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .
COPY --from=frontend-build /app/dist ./dist

EXPOSE 5006

CMD ["node", "backend/server.js"]
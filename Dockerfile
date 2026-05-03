# Use official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy root package files
COPY package*.json ./
RUN npm install --production

# Copy frontend
COPY frontend ./frontend

# Copy backend
COPY backend ./backend
WORKDIR /app/backend
RUN npm install --production

# Expose port
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Start the server
CMD ["node", "src/server.js"]

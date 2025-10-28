# Use lightweight Node.js base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy only package files first to leverage Docker layer caching
COPY package.json ./

# Install dependencies
RUN npm install && npm install -g serve vite

# Copy the rest of the application
COPY . .

# Build the app (assumes Vite config outputs to 'dist/')
RUN npm run build

# Serve the build output
CMD ["serve", "-s", "dist", "-l", "5173"]
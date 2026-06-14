# Use an official Node.js runtime as a lightweight base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy app source
COPY . ./

# Expose application port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]

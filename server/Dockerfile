FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose the application port (adjust if different)
EXPOSE 3000

# Define the start command
CMD ["node", "server.js"]

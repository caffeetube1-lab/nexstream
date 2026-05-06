# Use Node.js as the base image
FROM node:18-slim

# Install system dependencies: python3 (for yt-dlp) and ffmpeg
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp globally
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of the application
COPY . .

# Remove the Windows binary if it exists in the image to save space
RUN rm -f yt-dlp.exe

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]

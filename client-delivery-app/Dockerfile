FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port for Expo dev server
EXPOSE 19000
EXPOSE 19001
EXPOSE 19002

# Start the Expo development server
CMD ["npm", "start"] 
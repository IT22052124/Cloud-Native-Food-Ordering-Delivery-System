FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
ENV PORT=5001
EXPOSE 5001
CMD ["node", "src/index.js"]
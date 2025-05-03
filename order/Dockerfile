FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
ENV PORT=5002
EXPOSE 5002
CMD ["node", "index.js"]
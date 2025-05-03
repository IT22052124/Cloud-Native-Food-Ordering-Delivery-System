FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
ENV PORT=5004
EXPOSE 5004
CMD ["node", "app.js"]
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
ENV PORT=5006
EXPOSE 5006
CMD ["node", "index.js"]
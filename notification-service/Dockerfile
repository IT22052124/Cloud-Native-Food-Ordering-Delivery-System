FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
ENV PORT=5007
EXPOSE 5007
CMD ["node", "index.js"]
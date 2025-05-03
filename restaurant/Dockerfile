FROM node:18-alpine
WORKDIR /app
COPY restaurant/package*.json ./
COPY shared-kafka/shared-kafka-1.0.0.tgz ./
RUN npm install shared-kafka.tgz && \
    npm ci --only=production
COPY . .
ENV PORT=5006
EXPOSE 5006
CMD ["node", "index.js"]
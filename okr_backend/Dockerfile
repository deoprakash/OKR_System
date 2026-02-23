FROM node:18-alpine

WORKDIR /app

# Install production dependencies first to leverage Docker layer caching
COPY package*.json ./
RUN npm ci --only=production

# Copy app source
COPY . .

ENV NODE_ENV=production

EXPOSE 5000

CMD ["node", "src/index.js"]

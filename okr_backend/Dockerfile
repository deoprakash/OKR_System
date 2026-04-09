FROM node:18-alpine

WORKDIR /app

# Install production dependencies first to leverage Docker layer caching
COPY okr_backend/package*.json ./
RUN npm install --omit=dev

# Copy app source
COPY okr_backend/ ./

ENV NODE_ENV=production

EXPOSE 5000

CMD ["node", "src/index.js"]

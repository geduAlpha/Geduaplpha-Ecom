FROM node:20-alpine

WORKDIR /app

# Copy package manifests first for caching
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies for root, server, and client
RUN npm install
RUN npm install --prefix server
RUN npm install --prefix client

# Copy source code
COPY . .

# Build production React bundle
RUN npm run build --prefix client

# Set runtime environment
ENV NODE_ENV=production
ENV PORT=8000

EXPOSE 8000

# Start Express server (serves both API & React client)
CMD ["node", "server/index.js"]

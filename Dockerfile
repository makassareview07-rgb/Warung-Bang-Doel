# Multi-stage Dockerfile untuk Deployment Cloud Server (Google Cloud Run / AWS ECS / VPS)
FROM node:20-alpine AS builder

WORKDIR /app

# Salin dependensi package
COPY package*.json ./
RUN npm ci

# Salin seluruh source code & build frontend
COPY . .
RUN npm run build

# Stage 2: Production Runner
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --only=production

# Salin file server dan hasil build frontend
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/serverStorage.ts ./serverStorage.ts
COPY --from=builder /app/data ./data
COPY --from=builder /app/public ./public

# Expose port 3000
EXPOSE 3000

# Jalankan server full-stack cloud
CMD ["npx", "tsx", "server.ts"]

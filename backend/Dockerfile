# ---- Stage 1: Builder ----
FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy config and source
COPY nest-cli.json tsconfig*.json ./
COPY prisma ./prisma
COPY src ./src

# Generate Prisma Client and build app
RUN npx prisma generate
RUN npm run build

# ---- Stage 2: Production ----
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

# Install only production deps
COPY package*.json ./
RUN npm ci --only=production

# Copy build output and prisma artifacts
COPY --from=builder /app/dist ./dist
COPY prisma ./prisma
COPY --from=builder /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma /app/node_modules/@prisma

EXPOSE 3000
CMD ["node", "dist/main.js"]

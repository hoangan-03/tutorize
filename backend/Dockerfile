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
COPY scripts ./scripts

# Generate Prisma Client
RUN npx prisma generate

# Build app
RUN npm run build

# Verify main.js was created
RUN test -f dist/main.js || (echo "ERROR: dist/main.js not found after build!" && exit 1)

# Build scripts separately (for database seeding)
RUN npx tsc scripts/*.ts --outDir dist/scripts --module commonjs --target ES2021 \
    --esModuleInterop --skipLibCheck --resolveJsonModule --allowSyntheticDefaultImports \
    --emitDecoratorMetadata --experimentalDecorators

# Verify init-db.js was created
RUN test -f dist/scripts/init-db.js || (echo "WARNING: dist/scripts/init-db.js not found, seed data may not work" && exit 0)

# ---- Stage 2: Production ----
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

# Install dependencies for Prisma and Puppeteer
RUN apk add --no-cache \
    openssl \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    && rm -rf /var/cache/apk/*

# Tell Puppeteer to skip installing Chrome. We'll be using the installed version.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Install only production deps
COPY package*.json ./
RUN npm ci --only=production

# Copy build output and prisma artifacts
COPY --from=builder /app/dist ./dist
COPY prisma ./prisma
COPY --from=builder /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma /app/node_modules/@prisma

# Verify critical files exist in production image
RUN test -f dist/main.js || (echo "FATAL: dist/main.js not found in production image!" && exit 1)
RUN test -f dist/scripts/init-db.js || echo "Warning: dist/scripts/init-db.js not found"

# List dist contents for debugging
RUN echo "=== Production image dist/ contents ===" && ls -la dist/ && \
    echo "=== Production image dist/scripts/ contents ===" && ls -la dist/scripts/ || echo "No scripts directory"

EXPOSE 3000
CMD ["node", "dist/main.js"]

# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# pnpm via corepack (version pinned by "packageManager" in package.json)
RUN corepack enable

# Copy manifest + lockfile first so the dependency layer is cached
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies (dev dependencies included: the migration CLI needs ts-node)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Verify build output in builder stage
RUN ls -la dist/

# Production stage
FROM node:22-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Reuse the dependencies installed in the builder (same base image, so native
# modules such as bcrypt are already compiled for it)
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules

# Copy built application from builder stage
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# Copy TypeScript source for migration CLI
COPY --from=builder --chown=nestjs:nodejs /app/src ./src
COPY --from=builder --chown=nestjs:nodejs /app/tsconfig.json ./tsconfig.json
COPY --from=builder --chown=nestjs:nodejs /app/tsconfig.build.json ./tsconfig.build.json

# Run as non-root user
USER nestjs

# Final image structure check (debug)
RUN ls -R dist | head -n 20

# Expose port (Render defaults to 10000 or uses $PORT)
EXPOSE 3000

# Run migrations then start the app
CMD ["sh", "-c", "./node_modules/.bin/typeorm-ts-node-commonjs migration:run -d src/database/data-source.ts && node dist/main.js"]

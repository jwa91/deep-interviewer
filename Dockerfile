# ═══════════════════════════════════════════════════════════════
# Deep Interviewer - Multi-stage Docker Build
# ═══════════════════════════════════════════════════════════════

# ---- Build Stage ----
FROM node:22-alpine AS build

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the frontend and server
RUN pnpm build
RUN pnpm build:server

# ---- Production Stage ----
FROM node:22-alpine AS production

# Install pnpm for running
RUN npm install -g pnpm

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Rebuild native modules (better-sqlite3)
RUN pnpm rebuild better-sqlite3

# Copy built server code
COPY --from=build /app/dist-server ./dist-server

# Copy built frontend code
COPY --from=build /app/dist ./client

# Copy shared types (needed at runtime if referenced dynamically, though compiled code should be enough)
# Keeping it safe as previous dockerfile had it
COPY --from=build /app/src/shared ./src/shared

# Create data directory for SQLite
RUN mkdir -p /app/data

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001
ENV DATA_DIR=/app/data

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Start the server
CMD ["node", "dist-server/server/index.js"]

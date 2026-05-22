# ═══════════════════════════════════════════════════════════════
# Deep Interviewer - Multi-stage Docker Build
# ═══════════════════════════════════════════════════════════════

# ---- Build Stage ----
FROM node:24-alpine AS build

RUN corepack enable && corepack prepare pnpm@11.2.2 --activate

WORKDIR /app
RUN chown -R node:node /app
USER node

COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

COPY --chown=node:node . .

RUN pnpm build
RUN pnpm build:server

# ---- Production Stage ----
FROM node:24-alpine AS production

RUN corepack enable && corepack prepare pnpm@11.2.2 --activate

WORKDIR /app
RUN chown -R node:node /app
USER node

COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

# better-sqlite3 uses prebuilt binaries via prebuild-install
RUN pnpm install --frozen-lockfile --prod

COPY --from=build --chown=node:node /app/dist-server ./dist-server
COPY --from=build --chown=node:node /app/dist ./client
COPY --from=build --chown=node:node /app/src/shared ./src/shared

# Mount point for SQLite data (overlaid by bind mount at runtime)
RUN mkdir -p /app/data

ENV NODE_ENV=production
ENV PORT=3001
ENV DATA_DIR=/app/data

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

CMD ["node", "dist-server/server/index.js"]

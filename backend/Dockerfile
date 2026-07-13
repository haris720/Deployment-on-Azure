# Multi-stage: the toolchain (TypeScript, Prisma CLI, dev deps) stays
# in the builder, so the shipped image carries only production deps
# and compiled JS. A single-stage `FROM node:22` image, as in the
# guide, is ~1.1GB and ships your source and dev dependencies.

FROM node:22-slim AS builder

WORKDIR /app

# Prisma's engines need OpenSSL.
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm ci

COPY . .

# Runs `prisma generate && tsc && cp -r src/generated dist/generated`
RUN npm run build


FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

COPY prisma ./prisma
COPY prisma.config.ts ./

# Written to at runtime, so they must exist and be owned by `node`.
RUN mkdir -p uploads logs && chown -R node:node uploads logs

# Never run the API as root.
USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD node -e "fetch('http://localhost:5000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/server.js"]

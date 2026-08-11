# syntax=docker/dockerfile:1

# ---- builder ----
FROM node:22-slim AS builder
WORKDIR /app

# Prisma precisa de openssl
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

# manifestos primeiro (cache de dependências)
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/backend/package.json apps/backend/
COPY apps/frontend/package.json apps/frontend/
RUN npm ci

# código
COPY tsconfig.base.json ./
COPY packages/shared packages/shared
COPY apps/backend apps/backend

RUN npm run build -w @app/shared \
  && npm run prisma:generate -w @app/backend \
  && npm run build -w @app/backend

# ---- runner ----
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma

EXPOSE 3333
CMD ["node", "apps/backend/dist/main.js"]

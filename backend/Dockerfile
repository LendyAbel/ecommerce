# syntax=docker/dockerfile:1
FROM node:22-slim AS base
WORKDIR /app
# Prisma (motor de migraciones) necesita openssl; node:22-slim no lo trae.
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# --- deps + build ---
FROM base AS build
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

ENV DATABASE_URL="postgresql://user:password@localhost:5432/db"
RUN npx prisma generate
RUN npm run build

# --- runtime ---
FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts

EXPOSE 3001
CMD ["node", "dist/src/index.js"]

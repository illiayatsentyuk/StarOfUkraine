FROM node:20-alpine AS base
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/frontend/package.json ./apps/frontend/

RUN pnpm install --frozen-lockfile --filter frontend...

FROM base AS development
COPY apps/frontend ./apps/frontend
WORKDIR /app
EXPOSE 4040
CMD ["pnpm", "--filter", "frontend", "run", "dev"]

FROM base AS production
COPY apps/frontend ./apps/frontend
RUN pnpm --filter frontend run build
WORKDIR /app
CMD ["pnpm", "--filter", "frontend", "run", "start"]

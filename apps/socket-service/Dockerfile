FROM node:20-alpine AS base
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/socket-service/package.json ./apps/socket-service/

RUN pnpm install --frozen-lockfile --filter socket-service...

FROM base AS development
COPY apps/socket-service ./apps/socket-service
WORKDIR /app
CMD ["pnpm", "--filter", "socket-service", "run", "dev"]

FROM base AS production
COPY apps/socket-service ./apps/socket-service
WORKDIR /app
RUN pnpm --filter socket-service run build
WORKDIR /app/apps/socket-service
CMD ["node", "dist/main"]

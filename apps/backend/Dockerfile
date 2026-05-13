FROM node:20-alpine AS base
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/

RUN pnpm install --frozen-lockfile --filter backend...

FROM base AS development
COPY apps/backend ./apps/backend
WORKDIR /app
RUN pnpm --filter backend exec prisma generate
CMD ["pnpm", "--filter", "backend", "run", "dev"]

FROM base AS production
COPY apps/backend ./apps/backend
WORKDIR /app    
RUN pnpm --filter backend exec prisma generate
RUN pnpm --filter backend run build
WORKDIR /app/apps/backend
CMD ["node", "dist/main"]

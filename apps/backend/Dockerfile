FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN pnpm ci

FROM base AS development
COPY . .
CMD ["pnpm", "run", "dev"]

FROM base AS production
COPY . .
RUN pnpm run build
CMD ["node", "dist/main"]
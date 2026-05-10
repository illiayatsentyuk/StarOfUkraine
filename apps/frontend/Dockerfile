FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN pnpm ci

FROM base AS development
COPY . .
CMD ["pnpm", "run", "dev", "--", "--host", "0.0.0.0"]

FROM base AS production
COPY . .
RUN pnpm run build
CMD ["pnpm", "run", "start"]
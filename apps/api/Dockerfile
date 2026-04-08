FROM node:20-bookworm
WORKDIR /app
COPY . .
RUN corepack enable
CMD ["sh", "-c", "pnpm install && pnpm --filter @ai-ide/api build && pnpm --filter @ai-ide/api start"]


FROM oven/bun:1.3.6

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --production

COPY src ./src
COPY sql ./sql
COPY openapi.yaml ./openapi.yaml

ENV NODE_ENV=production
EXPOSE 3000

CMD ["bun", "run", "src/index.ts"]

FROM oven/bun:latest AS builder

ARG DATABASE_URL= "file:./dev.db"
ENV DATABASE_URL=$DATABASE_URL

ARG DATABASE_PROXY_URL= "file:./dev.db"
ENV DATABASE_PROXY_URL=$DATABASE_PROXY_URL

WORKDIR /tmp/app

COPY --from=node:lts-slim /usr/local/bin/node /usr/local/bin/node
COPY package.json .

RUN bun install

COPY src ./src
COPY tsconfig.json .
COPY tailwind.config.js .
COPY prisma/ ./prisma/

RUN bun prisma:migrate
RUN bun prisma:generate
RUN bun run build

FROM oven/bun:latest AS runner

WORKDIR /app

COPY --from=builder /usr/local/bin/node /usr/local/bin/node
COPY --from=builder /tmp/app/package.json /app/package.json
COPY --from=builder /tmp/app/bun.lockb /app/bun.lockb
COPY --from=builder /tmp/app/prisma/ /app_default/prisma/
COPY --from=builder /tmp/app/prisma/schema.prisma /app/prisma/schema.prisma
COPY --from=builder /tmp/app/build /app/build
COPY --from=builder /tmp/app/dist /app/dist

RUN apt-get update && apt-get install -y ffmpeg
RUN apt-get install -y curl
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux -o /usr/local/bin/yt-dlp && chmod +x /usr/local/bin/yt-dlp

RUN bun install --production
RUN cd node_modules/sharp && bun install && cd ../..
RUN bun prisma:generate

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["bun", "start"]

FROM oven/bun:latest AS builder

ARG DATABASE_URL="file:./dev.db"
ENV DATABASE_URL=$DATABASE_URL
ARG DATABASE_PROXY_URL="file:./dev.db"
ENV DATABASE_PROXY_URL=$DATABASE_PROXY_URL
ARG VITE_DISCORD_CLIENT_ID=""
ENV VITE_DISCORD_CLIENT_ID=$VITE_DISCORD_CLIENT_ID
ARG VITE_WEBSITE_BASE_URL=""
ENV VITE_WEBSITE_BASE_URL=$VITE_WEBSITE_BASE_URL
ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

WORKDIR /tmp/app

# Copy node binary
COPY --from=node:lts-slim /usr/local/bin/node /usr/local/bin/node

COPY bun.lockb /tmp/app/

# Copy necessary package.json files
COPY package.json ./ 
COPY apps/bot/package.json ./apps/bot/ 
COPY apps/website/package.json ./apps/website/ 
COPY packages/translations/package.json ./packages/translations/ 
COPY packages/utilities/package.json ./packages/utilities/ 

RUN bun install

# Copy rest of the application
COPY . .

RUN bun prisma:migrate && bun prisma:generate && bun run build

# --- Runner Stage ---
FROM oven/bun:latest AS runner

WORKDIR /app

# Binaries
COPY --from=builder /usr/local/bin/node /usr/local/bin/node

# Package.json files
COPY --from=builder /tmp/app/package.json /app/
COPY --from=builder /tmp/app/apps/bot/package.json /app/apps/bot/
COPY --from=builder /tmp/app/packages/translations/package.json /app/packages/translations/
COPY --from=builder /tmp/app/packages/utilities/package.json /app/packages/utilities/

# Lockfiles
COPY --from=builder /tmp/app/bun.lockb /app/

# Database
COPY --from=builder /tmp/app/prisma/ /app_default/prisma/
COPY --from=builder /tmp/app/prisma/schema.prisma /app/prisma/

# Builds
COPY --from=builder /tmp/app/packages/translations/build /app/packages/translations/
COPY --from=builder /tmp/app/packages/utilities/build /app/packages/utilities/
COPY --from=builder /tmp/app/apps/bot/build /app/apps/bot/
COPY --from=builder /tmp/app/apps/website/build /app/apps/website/

# Install curl and yt-dlp, then download and extract ffmpeg from provided link
RUN apt-get update && \
    apt-get install -y curl xz-utils && \
    curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux -o /usr/local/bin/yt-dlp && \
    curl -LO https://github.com/yt-dlp/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-linux64-gpl.tar.xz && \
    tar xf ffmpeg-master-latest-linux64-gpl.tar.xz && \
    cp ffmpeg-master-latest-linux64-gpl/bin/* /usr/local/bin/ && \
    chmod +x /usr/local/bin/ffmpeg /usr/local/bin/ffprobe /usr/local/bin/ffplay /usr/local/bin/yt-dlp


RUN bun install && \
    cd node_modules/sharp && bun install && cd ../.. && \
    bun prisma:generate

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["bun", "start"]

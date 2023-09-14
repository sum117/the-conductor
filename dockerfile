FROM node:latest AS builder

ARG DATABASE_URL= "file:./deploy.db"
ENV DATABASE_URL=$DATABASE_URL

ARG DATABASE_PROXY_URL= "file:./deploy.db"
ENV DATABASE_PROXY_URL=$DATABASE_PROXY_URL

WORKDIR /tmp/app

RUN npm install -g pnpm
RUN npm install -g prisma

COPY package.json .

RUN pnpm install

COPY src ./src
COPY tsconfig.json .

COPY prisma/schema.prisma ./prisma/schema.prisma
RUN pnpm exec prisma migrate dev --name init
RUN pnpm exec prisma generate
RUN pnpm run build

FROM node:lts-slim AS runner

RUN npm install -g pnpm
RUN npm install -g bun
RUN npm install -g prisma

WORKDIR /app

COPY --from=builder /tmp/app/package.json /app/package.json
RUN pnpm install --production

COPY --from=builder /tmp/app/prisma/  /app/prisma/
RUN pnpm exec prisma generate

COPY --from=builder /tmp/app/build /app/build

CMD ["bun", "start"]

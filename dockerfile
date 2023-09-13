FROM oven/bun AS builder

WORKDIR /tmp/app

COPY package.json .
COPY bun.lockb .

RUN bun install

COPY src ./src
COPY tsconfig.json .

# This would be the optimal solution but it doesn't work, so I'm gonna use a hack here until I figure out how to fix it
#   RUN bunx prisma:generate
#   COPY prisma/schema.prisma ./prisma/schema.prisma
COPY node_modules/.prisma ./node_modules/.prisma

RUN bun run build

FROM oven/bun AS runner

ARG DEFAULT_DATABASE_URL= "file:./deploy.db"
ENV DATABASE_URL=$DEFAULT_DATABASE_URL

WORKDIR /app

COPY --from=builder /tmp/app/package.json /app/package.json
COPY --from=builder /tmp/app/bun.lockb /app/bun.lockb
RUN bun install -p

# Refer to the comment above
#   COPY --from=builder /tmp/app/prisma/schema.prisma ./prisma/schema.prisma
#   RUN bun run prisma:generate
COPY --from=builder /tmp/app/node_modules/.prisma /app/node_modules/.prisma

#   These commands aren't working either. The prisma:migrate has to be done in the external machine
#   RUN bun add prisma
#   RUN bun run prisma:migrate

COPY --from=builder /tmp/app/build /app/build

CMD ["bun", "start"]

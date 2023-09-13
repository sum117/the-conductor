bun run prisma:migrate
bun run prisma:generate -- --generator build
docker compose build --no-cache
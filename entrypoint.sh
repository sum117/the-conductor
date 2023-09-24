#!/bin/sh

# Verificar se o diretório /app/prisma está vazio
if [ -z "$(ls -A /app/prisma)" ]; then
   echo "O diretório /app/prisma está vazio. Inicializando..."
   cp -a /app_default/prisma/. /app/prisma/
   rm -rf /app_default/prisma
fi

# Executar o comando original (bun start)
exec bun start

#!/bin/sh

if [ -z "$(ls -A /app/prisma)" ]; then
   echo "The directory /app/prisma is empty. Initializing..."
   cp -a /app_default/prisma/. /app/prisma/
   rm -rf /app_default/prisma
fi

exec bun start

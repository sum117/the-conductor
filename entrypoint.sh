#!/bin/sh

if [ -z "$(ls -A /app/prisma)" ]; then
   echo "The directory /app/prisma is empty. Initializing..."
   cp -a /app_default/prisma/. /app/prisma/
   rm -rf /app_default/prisma
fi

if [ ! -d "/app/cache" ]; then
   mkdir -p /app/cache
   echo "This directory is used to cache files for the imageVideoMerge command" > /app/cache/README.txt
fi

exec bun start

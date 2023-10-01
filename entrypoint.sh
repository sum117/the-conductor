#!/bin/sh

initialize_directory() {
    local dir_path="$1"
    local init_action="$2"

    if [ -z "$(ls -A "$dir_path")" ]; then
        echo "The directory $dir_path is empty. Initializing..."
        $init_action
    fi
}

copy_prisma_files() {
    cp -a /app_default/prisma/. /app/prisma/
    rm -rf /app_default/prisma
}

create_cache_readme() {
    echo "This directory is used to cache files for the imageVideoMerge command" > /app/cache/README.txt
}

initialize_directory "/app/prisma" copy_prisma_files
initialize_directory "/app/cache" create_cache_readme

exec bun start
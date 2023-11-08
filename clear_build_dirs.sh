#!/bin/sh

clear_build_dirs() {
    echo "Clearing build directories...";
    find . -type d -name "build" -not -path "./node_modules/*" -exec rm -rf {} \;
    echo "Done.";
}

clear_build_dirs;

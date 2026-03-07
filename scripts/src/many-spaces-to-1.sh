#!/bin/bash

# Many spaces to 1

# Check if a file is provided
if [ $# -eq 0 ]; then
  echo "Usage: $0 filename"
  exit 1
fi

file="$1"

# Use sed to replace 2+ spaces with 1 space
sed -E 's/ {2,}/ /g' "$file" > "${file}.tmp" && mv "${file}.tmp" "$file"
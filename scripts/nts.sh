#!/bin/bash

file="text"

# Use perl for regex lookbehind/lookahead (sed/awk struggle with this)
perl -0777 -pe 's/(?<!\n)\r?\n(?!\n)/ /g' "$file" > "${file}.tmp" && mv "${file}.tmp" "$file"

echo "Single newline characters replaced with spaces, double newlines left intact."
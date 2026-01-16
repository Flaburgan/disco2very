#!/usr/bin/env bash

set -euo pipefail

IMAGE_DIR="public/images/ademe"
DATA_DIR="data/ademe"

for file in "$IMAGE_DIR"/*.svg; do
  # Extract the basename without extension
  slug=$(basename "$file" .svg)

  # Search in data/ademe/ for the slug
  if ! grep -qr "\"slug\":\s*\"$slug\"" "$DATA_DIR"; then
    echo "Delete $slug.svg" && rm "public/images/ademe/$slug.svg"
  fi
done

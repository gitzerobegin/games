#!/usr/bin/env sh
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

echo "Installing dependencies..."
npm install

echo "Deploying from $REPO_ROOT"
npx wrangler deploy

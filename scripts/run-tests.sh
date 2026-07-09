#!/usr/bin/env bash
set -euo pipefail

PLATFORM="${1:-ios}"
shift || true

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck disable=SC1091
source "$ROOT_DIR/scripts/lib.sh"

load_env "$ROOT_DIR"
cd "$ROOT_DIR"

export MOBILEWRIGHT_DEVICE_ID="$(require_device_id "$PLATFORM")"

if [[ "$PLATFORM" == "android" ]]; then
  echo "Downloading latest Android WLAC build from Expo..."
  node scripts/download-eas-build.mjs android --latest
fi

npx mobilewright test --project="$PLATFORM" "$@"

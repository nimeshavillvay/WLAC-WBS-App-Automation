#!/usr/bin/env bash
set -euo pipefail

PLATFORM="${1:-ios}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck disable=SC1091
source "$ROOT_DIR/scripts/lib.sh"

load_env "$ROOT_DIR"
cd "$ROOT_DIR"

DEVICE_ID="$(require_device_id "$PLATFORM")"

if [[ "$PLATFORM" == "android" ]]; then
  INSTALL_APP="${MOBILEWRIGHT_INSTALL_APPS_ANDROID:-}"
  EXT="apk"
else
  INSTALL_APP="${MOBILEWRIGHT_INSTALL_APPS_IOS:-}"
  EXT="ipa"
fi

if [[ -z "$INSTALL_APP" ]]; then
  INSTALL_APP="$(ls -t "$ROOT_DIR"/builds/*."$EXT" 2>/dev/null | head -1 || true)"
fi

if [[ -z "$INSTALL_APP" || ! -f "$INSTALL_APP" ]]; then
  echo "No .$EXT found. Run: npm run download:build:$PLATFORM"
  exit 1
fi

echo "Installing $INSTALL_APP on $PLATFORM device $DEVICE_ID ..."
npx mobilecli apps install "$INSTALL_APP" --device "$DEVICE_ID"

echo "Installed. Verify with: npm run setup"

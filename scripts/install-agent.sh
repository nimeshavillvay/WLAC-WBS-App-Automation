#!/usr/bin/env bash
set -euo pipefail

PLATFORM="${1:-ios}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck disable=SC1091
source "$ROOT_DIR/scripts/lib.sh"

load_env "$ROOT_DIR"
cd "$ROOT_DIR"

DEVICE_ID="$(require_device_id "$PLATFORM")"

echo "Installing Mobilewright agent on $PLATFORM device $DEVICE_ID ..."

if [[ "$PLATFORM" == "ios" ]]; then
  PROFILE="${MOBILEWRIGHT_IOS_PROVISIONING_PROFILE:-}"
  if [[ -z "$PROFILE" ]]; then
    echo "Set MOBILEWRIGHT_IOS_PROVISIONING_PROFILE in .env."
    exit 1
  fi
  npx mobilewright install --device "$DEVICE_ID" --provisioning-profile "$PROFILE"
else
  npx mobilewright install --device "$DEVICE_ID"
fi

npx mobilecli agent status --device "$DEVICE_ID"

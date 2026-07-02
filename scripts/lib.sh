#!/usr/bin/env bash

load_env() {
  local root_dir="$1"
  if [[ -f "$root_dir/.env" ]]; then
    set -a
    # shellcheck disable=SC1091
    source "$root_dir/.env"
    set +a
  fi
}

resolve_device_id() {
  local platform="$1"
  if [[ "$platform" == "android" ]]; then
    printf '%s' "${MOBILEWRIGHT_DEVICE_ID_ANDROID:-${MOBILEWRIGHT_DEVICE_ID:-}}"
    return
  fi
  printf '%s' "${MOBILEWRIGHT_DEVICE_ID_IOS:-${MOBILEWRIGHT_DEVICE_ID:-}}"
}

require_device_id() {
  local platform="$1"
  local device_id
  device_id="$(resolve_device_id "$platform")"

  if [[ -z "$device_id" ]]; then
    if [[ "$platform" == "android" ]]; then
      echo "Set MOBILEWRIGHT_DEVICE_ID_ANDROID in .env."
    else
      echo "Set MOBILEWRIGHT_DEVICE_ID_IOS in .env."
    fi
    echo "Run: npm run devices"
    exit 1
  fi

  printf '%s' "$device_id"
}

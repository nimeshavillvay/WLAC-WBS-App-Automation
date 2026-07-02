/** @typedef {"ios" | "android"} Platform */

/** @param {Platform} platform */
export function resolveDeviceId(platform) {
  if (platform === "android") {
    return (
      process.env.MOBILEWRIGHT_DEVICE_ID_ANDROID ??
      process.env.MOBILEWRIGHT_DEVICE_ID
    );
  }

  return (
    process.env.MOBILEWRIGHT_DEVICE_ID_IOS ??
    process.env.MOBILEWRIGHT_DEVICE_ID
  );
}

/** @param {Platform} platform */
export function resolveEasBuildId(platform) {
  const envKey =
    platform === "ios" ? "EAS_BUILD_ID_IOS" : "EAS_BUILD_ID_ANDROID";

  return (
    process.env[envKey] ??
    (platform === "ios" ? process.env.EAS_BUILD_ID : undefined)
  );
}

/** @param {Platform} platform */
export function resolveEasArchiveUrl(platform) {
  const envKey =
    platform === "ios"
      ? "EAS_APPLICATION_ARCHIVE_URL_IOS"
      : "EAS_APPLICATION_ARCHIVE_URL_ANDROID";

  return (
    process.env[envKey] ??
    (platform === "ios" ? process.env.EAS_APPLICATION_ARCHIVE_URL : undefined)
  );
}

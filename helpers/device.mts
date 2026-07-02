import type { Device } from "@mobilewright/core";

export async function getActiveBundleId(device: Device) {
  const foregroundApp = await device.getForegroundApp();
  return typeof foregroundApp === "string"
    ? foregroundApp
    : foregroundApp.bundleId;
}

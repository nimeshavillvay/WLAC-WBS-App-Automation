/** @type {Record<string, { bundleId: string; label: string }>} */
export const environments = {
  dev: {
    bundleId: "com.wurth.lac.dev",
    label: "Development",
  },
  qa: {
    bundleId: "com.wurth.lac.qa",
    label: "QA / Preview",
  },
  production: {
    bundleId: "com.wurth.lac",
    label: "Production",
  },
};

export function resolveEnvironment() {
  const env = process.env.APP_ENV ?? "qa";

  if (!(env in environments)) {
    throw new Error(
      `Unknown APP_ENV "${env}". Expected one of: ${Object.keys(environments).join(", ")}`,
    );
  }

  return { key: env, ...environments[env] };
}

export function resolveBundleId() {
  return process.env.MOBILEWRIGHT_BUNDLE_ID ?? resolveEnvironment().bundleId;
}

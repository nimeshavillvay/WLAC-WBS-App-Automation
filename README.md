# WurthLAC Mobile — QE Automation

Standalone [Mobilewright](https://mobilewright.dev) test suite for the WurthLAC mobile app on **real iOS and Android devices**.

## Quick start

```bash
npm install
cp .env.example .env   # set device IDs
npm run setup
```

### iOS

```bash
npm run download:build:ios
npm run install:app:ios
npm run install:agent:ios    # one-time, needs provisioning profile
npm run test:ios
```

Default build: [EAS iOS QA preview](https://expo.dev/accounts/wurth-louis/projects/wurth-lac/builds/3317ab5b-a67f-4a37-adaf-222285fe50f8)

### Android

```bash
npm run download:build:android
npm run install:app:android
npm run install:agent:android    # one-time, no profile needed
npm run test:android
```

Default build: [EAS Android QA preview](https://expo.dev/accounts/wurth-louis/projects/wurth-lac/builds/920933d8-1a0a-4d86-87a1-39f69f842e4a)

## Configuration (`.env`)

| Variable | Purpose |
|----------|---------|
| `APP_ENV` | `dev` \| `qa` \| `production` → bundle ID |
| `MOBILEWRIGHT_DEVICE_ID_IOS` | iPhone UDID from `npm run devices` |
| `MOBILEWRIGHT_DEVICE_ID_ANDROID` | Android serial from `adb devices` |
| `EAS_BUILD_ID_IOS` / `EAS_BUILD_ID_ANDROID` | EAS build to download |
| `MOBILEWRIGHT_INSTALL_APPS_IOS` / `_ANDROID` | Path to `.ipa` / `.apk` |
| `MOBILEWRIGHT_IOS_PROVISIONING_PROFILE` | iOS agent only (not the app) |

## Environment mapping

| `APP_ENV` | Bundle ID |
|-----------|-----------|
| `dev` | `com.wurth.lac.dev` |
| `qa` | `com.wurth.lac.qa` |
| `production` | `com.wurth.lac` |

## Project structure

```text
lac-mobile-qe/
├── builds/              # .ipa / .apk artifacts (gitignored)
├── config/              # env, platform, EAS defaults
├── helpers/             # shared test utilities
├── scripts/             # download, install, run helpers
├── tests/
└── mobilewright.config.mjs
```

## Troubleshooting

### `lookup localhost: no such host`

```bash
sudo tee /etc/hosts <<'EOF'
127.0.0.1       localhost
255.255.255.255 broadcasthost
::1             localhost
EOF
```

### App not installing

- Build must match `APP_ENV` bundle ID
- iOS: device UDID must be in the `.ipa` provisioning profile
- Android: enable USB debugging and accept the trust prompt

### Agent not installed

```bash
npm run install:agent:ios        # requires MOBILEWRIGHT_IOS_PROVISIONING_PROFILE
npm run install:agent:android
```

## Adding tests

```typescript
import { expect, test } from "@mobilewright/test";

test("example", async ({ screen }) => {
  await expect(screen.getByTestId("sign-in-home-page-button")).toBeVisible();
});
```

Prefer `getByTestId`, `getByText`, and `getByLabel` for cross-platform locators.

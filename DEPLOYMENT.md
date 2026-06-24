# Deployment Guide

## Current release configuration

Current app version metadata from `app.json`:

- App version: `1.0.0`
- Android `versionCode`: `18`
- iOS `buildNumber`: `25`
- Android package: `com.rajuan.dev.personal_stylist_app`
- iOS bundle identifier: `com.pbell.ustyle.dev`

Current EAS metadata from `eas.json`:

- CLI version requirement: `>= 18.13.0`
- Profiles: `development`, `preview`, `production`
- Production builds use `autoIncrement: true`
- iOS submit config includes `ascAppId: 6771131711`

## Local native builds

### Android

Preferred local command on Windows:

```sh
npm run android
```

Direct Expo command:

```sh
npx expo run:android
```

If Windows file-lock issues appear during Gradle cleanup, stop Java/Gradle processes and retry. The project already includes Android portability helpers in:

- `scripts/run-android-shortpath.ps1`
- `plugins/withAndroidPortability.js`

### iOS

On macOS:

```sh
npm run ios
```

Equivalent command:

```sh
npx expo run:ios
```

Note: no `ios/` directory is currently present in the repository. iOS native project generation and any native iOS customization state should be treated as `To be confirmed`.

## EAS build commands

### Development client

```sh
eas build --platform android --profile development
eas build --platform ios --profile development
```

### Internal preview builds

```sh
eas build --platform android --profile preview
eas build --platform ios --profile preview
```

### Production builds

```sh
eas build --platform android --profile production
eas build --platform ios --profile production
```

## Submission / store deployment

### iOS / TestFlight / App Store

The repository includes iOS submit metadata in `eas.json`, so the documented path is:

```sh
eas submit --platform ios --profile production
```

Recommended release flow:

1. Confirm app version and build metadata in `app.json`.
2. Run a production iOS build with EAS.
3. Submit with `eas submit --platform ios --profile production`.
4. Complete TestFlight/App Store review steps in App Store Connect.

Required account setup:

- Apple Developer account
- App Store Connect app matching `ascAppId: 6771131711`
- Expo account access for the configured owner
- Firebase project access for production validation

### Android

Android EAS build commands are configured, but Android Play Store submission steps are not documented in this repository.

Android release upload flow is therefore `To be confirmed`.

## Versioning notes

Before a release:

- Update `expo.version` in `app.json` when the user-facing version changes.
- Update Android `versionCode` if not relying on a generated workflow.
- Update iOS `buildNumber` if not relying on a generated workflow.
- Production EAS builds already specify `autoIncrement: true`, which helps with build-number management.

Because the native `android/` directory is not tracked, any manual native versioning changes made only in generated files are not backed up in GitHub by default.

## Firebase / Expo account prerequisites

- Expo project owner in `app.json`: `rajuan.official.mail`
- EAS project ID present in `app.json`
- Firebase Android and iOS config files available locally
- Apple signing assets and credentials available in Expo/App Store Connect
- Android signing configuration for store release is `To be confirmed`

## Final QA checklist

- Install dependencies with `npm install`
- Confirm the app starts with `npm start`
- Confirm Android build succeeds locally or on EAS
- Confirm iOS build succeeds on macOS or EAS
- Confirm sign-up, sign-in, email verification, and password reset flows
- Confirm Firestore reads/writes for closet items, outfits, favorites, and notifications
- Confirm Firebase Storage uploads for clothing images and profile images
- Confirm Firebase config files are present locally but not re-committed accidentally
- Confirm release version/build numbers are correct
- Confirm TestFlight metadata and screenshots outside this repo, if applicable

## Backup / GitHub notes

What is backed up in GitHub today:

- JavaScript/TypeScript source under `src/`
- Expo config files such as `app.json` and `eas.json`
- Firebase Firestore rules
- Scripted/local portability helpers
- Top-level Firebase native config files, which are currently tracked

What is not fully backed up as tracked source:

- Generated Android native project files under `android/`
- Any iOS native project files under `ios/`
- Local machine credentials and signing assets, which should remain outside Git

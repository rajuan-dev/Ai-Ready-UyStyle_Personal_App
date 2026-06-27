# Ustyle

Ustyle is a React Native mobile app for managing a personal digital closet, creating outfits, saving favorites, and receiving in-app recommendations and reminders. The project uses Expo prebuild with React Native and Firebase services for authentication, data storage, and media storage.

## Tech stack

- React Native `0.83.6`
- Expo `~55.0.26`
- Firebase JS SDK `12.10.0`
- React Navigation
- AsyncStorage

## Main features

- Email/password authentication with email verification and password reset
- User profile creation and style preference storage
- Closet item creation, editing, deletion, and image upload
- Outfit composition, preview, save flow, and favorite looks
- Firestore-backed notifications
- Profile photo upload and account settings
- AI chat screen present in navigation

Note: an AI chat screen exists in the app, but the repository does not currently show an external AI provider integration or `.env`-based AI API configuration. That backend dependency is still to be confirmed.

## Repository status

The repository is connected to GitHub remotes:

- `origin`: `git@github.com:iam-rajuan/Ai-Ready-UyStyle_Personal_App.git`
- `alt`: `https://github.com/rajuan-dev/Ai-Ready-UyStyle_Personal_App.git`

Tracked source/config files already present in Git include:

- `README.md`
- `package.json`
- `app.json`
- `eas.json`
- `firestore.rules`
- `src/firebase/client.ts`
- `google-services.json`
- `GoogleService-Info.plist`

Important limitations:

- The native `android/` directory is ignored by `.gitignore` and is not currently backed up in GitHub as tracked source.
- No `ios/` directory is present in the repository.
- The top-level Firebase native config files are currently tracked in Git, which is not ideal for long-term credential hygiene even though they are required for native builds.

## Local setup

### Requirements

- Node.js `>= 22.11.0` from `package.json`
- npm
- Android Studio / Android SDK for Android builds
- Xcode for iOS builds on macOS only
- Expo CLI via `npx`

### Install dependencies

```sh
npm install
```

The repo runs a `postinstall` patch script that modifies the local Expo CLI package to improve Android device ABI handling on this project. Re-run `npm install` if `node_modules` is removed.

### Run locally

Start Metro:

```sh
npm start
```

Run Android:

```sh
npm run android
```

`npm run android` calls `scripts/run-android-shortpath.ps1`, which:

- detects the Android SDK location
- writes `android/local.properties`
- clears stale Android build folders under `node_modules`
- removes conflicting installs from connected devices
- runs `npx expo run:android`

You can also run:

```sh
npx expo run:android
```

Run iOS on macOS:

```sh
npm run ios
```

This project uses `expo run:ios` for iOS native execution.

## Expo / native workflow notes

- This is an Expo prebuild-style React Native app, not an Expo Go app.
- The repository contains Expo config in `app.json` and EAS config in `eas.json`.
- A custom Expo config plugin at `plugins/withAndroidPortability.js` writes `android/local.properties` and redirects Windows node-module Android build output away from locked `node_modules` paths.
- Because `android/` is ignored, native Android project files are treated as generated/local rather than canonical tracked source.

## Firebase usage summary

Firebase setup is documented in `FIREBASE_SETUP.md`. Based on the current codebase:

- Firebase Authentication is used for sign-up, sign-in, sign-out, email verification, password reset, and password change.
- Firestore is used for user profiles, closet items, outfits, likes, notifications, categories, and preferences.
- Firebase Storage is used for image uploads and shared outfit HTML uploads.
- Firebase Analytics is implemented via `@react-native-firebase/analytics`, with typed MVP event wrappers in `src/services/analytics.ts` (onboarding, closet, outfit builder, share, favorites, style preferences). No PII is logged.
- Firebase Crashlytics is implemented via `@react-native-firebase/crashlytics`, with a wrapper in `src/services/crashlytics.ts` for user identification (UID only), breadcrumbs, and non-fatal error recording across key catch blocks. Both are native modules and require a native rebuild (`expo run` / EAS) — see `FIREBASE_SETUP.md`.

## Environment configuration

Environment details are documented in `ENVIRONMENT.md`.

Current state:

- No `.env` loader is configured in the app code.
- Firebase web config is currently hardcoded in `src/firebase/client.ts`.
- Native Firebase config files are referenced from `app.json`.

## Build and deployment

Build and release notes are documented in `DEPLOYMENT.md`.

Useful commands:

```sh
eas build --platform android --profile preview
eas build --platform android --profile production
eas build --platform ios --profile preview
eas build --platform ios --profile production
eas submit --platform ios --profile production
```

## Security notes

- Do not commit Apple certificates, `.p8`, `.p12`, provisioning profiles, private API keys, passwords, or private `.env` files.
- The repository currently tracks `google-services.json` and `GoogleService-Info.plist`. That should be reviewed and cleaned up if those files are intended to stay private.
- `.gitignore` has been updated to protect future commits, but ignore rules do not automatically remove files that are already tracked.

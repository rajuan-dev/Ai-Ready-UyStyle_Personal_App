# Environment Configuration

## Current state

This repository does not currently use a `.env` loader or `EXPO_PUBLIC_*` variables in application code.

What is configured directly in source/config today:

- Firebase web config is hardcoded in `src/firebase/client.ts`
- Native Firebase file paths are configured in `app.json`
- Android SDK discovery is handled by project scripts and plugin logic

Because `.env` files are not currently consumed by the app, a `.env.example` file has not been added. Adding one without matching runtime support would be misleading.

## Required local tools

- Node.js `>= 22.11.0`
- npm
- Android SDK for Android development
- Xcode on macOS for iOS development

## Local machine variables

The Android helper logic checks these environment variables when available:

- `ANDROID_HOME`
- `ANDROID_SDK_ROOT`
- `LOCALAPPDATA`
- `USERPROFILE`

If `ANDROID_HOME` or `ANDROID_SDK_ROOT` is not already set, the project attempts to detect the SDK from common machine paths and writes `android/local.properties` automatically during Android runs.

## Sensitive values

Do not store these in Git:

- private `.env` files
- Apple signing certificates
- `.p8` keys
- `.p12` certificates
- provisioning profiles
- keystores for production release signing
- passwords and secrets

## To be confirmed

- Whether the team wants to migrate Firebase web config out of source and into an environment-based pattern
- Whether any CI/CD environment variables are configured outside the repository

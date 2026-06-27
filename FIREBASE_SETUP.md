# Firebase Setup

## Current implementation

Firebase is initialized in `src/firebase/client.ts` using the Firebase JS SDK.

Services confirmed in the current codebase:

- Firebase Authentication
- Cloud Firestore
- Firebase Storage

Services not currently implemented in the repository:

- Firebase Analytics
- Firebase Crashlytics
- Firebase Cloud Messaging

## Firebase Authentication

Authentication usage confirmed in the codebase:

- Email/password sign-up
- Email/password sign-in
- Email verification
- Password reset
- Password change after re-authentication
- Sign-out

Auth state is persisted with AsyncStorage through `getReactNativePersistence(...)`.

Relevant files:

- `src/firebase/client.ts`
- `src/context/AuthContext.tsx`
- `src/Screens/signup/SignupScreen.tsx`
- `src/Screens/signin/SignInScreen.tsx`
- `src/Screens/signin/ForgotPasswordScreen.tsx`
- `src/Screens/profile/Changepassword/ChangePasswordScreen.tsx`

## Firestore usage

Firestore is used throughout the app for profile and closet data.

### Collections visible from code and rules

- `users`
- `users/{userId}/preferences`
- `closetItems`
- `categories`
- `outfits`
- `outfitSlots`
- `outfitFires`
- `likes`
- `notifications`

Source of truth:

- `firestore.rules`

### Data responsibilities seen in code

- `users`: profile data such as name, email, phone, avatar/profile URLs
- `users/{userId}/preferences`: style preference selections
- `closetItems`: clothing items uploaded by a user
- `categories`: user-defined closet categories
- `outfits`: saved outfit documents
- `outfitSlots`: individual saved item-slot relationships for outfits
- `outfitFires`: per-user outfit reaction data
- `likes`: favorite looks
- `notifications`: Firestore-backed in-app notifications

## Firebase Storage usage

Storage paths visible from code:

- `closet/{uid}/{timestamp}.jpg`
- `closet/{uid}/shares/{shareId}.html`
- `profilePhotos/{uid}.jpg`
- `avatars/{uid}.jpg`

Relevant files:

- `src/Screens/addItem/AdditemScreen.tsx`
- `src/Screens/combin/PreviewScreen.tsx`
- `src/Screens/profile/Profileeditscreen.tsx`
- `src/settings/AccountSettingsScreen.tsx`

Storage security rules are not present in this repository. That setup is still to be confirmed.

## Native Firebase config files

The Expo config currently points to these files in the project root:

- Android: `./google-services.json`
- iOS: `./GoogleService-Info.plist`

Configured in:

- `app.json`

### Expected placement

- Keep `google-services.json` at the repository root because `app.json` references `./google-services.json`.
- Keep `GoogleService-Info.plist` at the repository root because `app.json` references `./GoogleService-Info.plist`.
- During local Android generation, Expo may also copy Android config into `android/app/google-services.json`.

## Firebase project setup checklist

1. Create or select the Firebase project.
2. Register the Android app with package name `com.rajuan.dev.personal_stylist_app`.
3. Register the iOS app with bundle identifier `com.pbell.ustyle.dev`.
4. Enable Email/Password in Firebase Authentication.
5. Create Firestore in Native mode.
6. Create a Firebase Storage bucket.
7. Apply Firestore rules from `firestore.rules`.
8. Download `google-services.json` and `GoogleService-Info.plist`.
9. Place those files in the project root as referenced by `app.json`.

## Analytics and Crashlytics status

### Analytics — ✅ IMPLEMENTED

**Package**: `@react-native-firebase/analytics` (native module)  
**Plugin registered**: `app.json` → plugins → `"@react-native-firebase/analytics"`  
**Service wrapper**: `src/services/analytics.ts`

#### Tracked MVP events

| Event name | Trigger location |
|---|---|
| `onboarding_complete` | `OnBordingScreen.tsx` — last slide → Next |
| `add_closet_item` | `AdditemScreen.tsx` — new item saved to Firestore |
| `generate_outfit` | `Combinescreen.tsx` — Preview button pressed |
| `build_another` | `PreviewScreen.tsx` — Edit Outfit pressed |
| `try_different_combinations` | `PreviewScreen.tsx` — Edit Outfit pressed |
| `wear_this` | `PreviewScreen.tsx` — Confirm Look pressed |
| `save_outfit` | `Combinescreen.tsx` (Save Look) + `PreviewScreen.tsx` (Confirm Look) |
| `share_look` | `PreviewScreen.tsx` — after Share.share() resolves |
| `favorite_look` | `ClosetScreen.tsx` — heart icon toggled on |
| `unfavorite_look` | `ClosetScreen.tsx` + `FavoriteLooksScreen.tsx` — heart toggled off |
| `update_style_preferences` | `StylePreferenceScreen.tsx` — Save pressed |

#### Verifying Analytics in development

```sh
# Android: enable DebugView on the physical device
adb shell setprop debug.firebase.analytics.app com.rajuan.dev.personal_stylist_app

# iOS: add this launch argument to your Xcode scheme
-FIRAnalyticsDebugEnabled
```

Then open **Firebase Console → Analytics → DebugView** and perform each action in the app. Events appear within ≈2 seconds.

### Crashlytics — ✅ IMPLEMENTED

**Package**: `@react-native-firebase/crashlytics` (native module)  
**Plugin registered**: `app.json` → plugins → `"@react-native-firebase/crashlytics"`  
**Service wrapper**: `src/services/crashlytics.ts`

#### Crashlytics integration points

| File | Context tag |
|---|---|
| `AuthContext.tsx` | Sets user ID (UID only) on auth state change |
| `AuthContext.tsx` | `ensure_user_profile`, `ensure_user_profile_refresh` |
| `SignInScreen.tsx` | `sign_in` (unexpected errors only) |
| `SignupScreen.tsx` | `sign_up` (unexpected errors only) |
| `AdditemScreen.tsx` | `add_closet_item` |
| `Combinescreen.tsx` | `add_outfit_slot`, `delete_outfit_slot`, `save_look_combine` |
| `PreviewScreen.tsx` | `delete_outfit`, `confirm_look`, `share_look` |
| `ClosetScreen.tsx` | `toggle_like_closet` |
| `FavoriteLooksScreen.tsx` | `unfavorite_look` |
| `StylePreferenceScreen.tsx` | `update_style_preferences` |
| `OutfitScreen.tsx` | `outfit_delete`, `outfit_fire_toggle` |

#### Verifying Crashlytics (first-time setup)

> Crashlytics is a **native-only** module. It does not work in Expo Go.
> You must use a development build: `eas build --profile development` or `npx expo run:android`.

1. Build a development client.
2. In a development build (`__DEV__ === true`), call `triggerTestCrash()` from `src/services/crashlytics.ts`.
3. Restart the app completely after the crash.
4. Wait up to 5 minutes for the crash to appear in **Firebase Console → Crashlytics**.
5. Confirm the crash report shows a symbolicated stack trace.

> **iOS Note**: For symbolicated stack traces in production, dSYMs must be uploaded.
> EAS Build uploads these automatically if Crashlytics is enabled in the project.
> Verify by checking **Firebase Console → Crashlytics → App Quality Insights**.

## Firebase project setup checklist

1. Create or select the Firebase project.
2. Register the Android app with package name `com.rajuan.dev.personal_stylist_app`.
3. Register the iOS app with bundle identifier `com.pbell.ustyle.dev`.
4. Enable Email/Password in Firebase Authentication.
5. Create Firestore in Native mode.
6. Create a Firebase Storage bucket.
7. Apply Firestore rules from `firestore.rules`.
8. Download `google-services.json` and `GoogleService-Info.plist`.
9. Place those files in the project root as referenced by `app.json`.
10. Enable **Google Analytics** in the Firebase project (required for Analytics and Crashlytics dashboards).
11. Run `eas build` (or `npx expo run:android` / `npx expo run:ios`) to produce a native build — Analytics and Crashlytics do not function in Expo Go.

## Security guidance

- Do not commit private service-account JSON files, API keys intended to remain secret, `.p8` keys, `.p12` certificates, provisioning profiles, or passwords.
- `google-services.json` and `GoogleService-Info.plist` are currently tracked in Git in this repository.
  To stop tracking them, run:
  ```sh
  git rm --cached google-services.json GoogleService-Info.plist
  git commit -m "chore: stop tracking Firebase config files"
  ```
  These files are already in `.gitignore`, so after untracking they will not be re-added.
- The Firebase web config in `src/firebase/client.ts` is hardcoded today. That is common for Firebase client apps, but if the team wants environment-based configuration, that migration has not been implemented yet.
- Analytics and Crashlytics service wrappers (`src/services/`) do not log any PII. Only the Firebase UID is used for user identification.

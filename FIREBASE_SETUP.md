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

### Analytics

- No Firebase Analytics dependency or event logging code was found in the repository.
- No event taxonomy is currently documented in code.
- Analytics verification steps are therefore `To be confirmed`.

### Crashlytics

- No Firebase Crashlytics dependency, native Gradle plugin, or initialization code was found in the repository.
- Crash reporting validation steps are therefore `To be confirmed`.

## Security guidance

- Do not commit private service-account JSON files, API keys intended to remain secret, `.p8` keys, `.p12` certificates, provisioning profiles, or passwords.
- `google-services.json` and `GoogleService-Info.plist` are currently tracked in Git in this repository. If they should not remain in GitHub, remove them from tracking and rotate/review related credentials as needed.
- The Firebase web config in `src/firebase/client.ts` is hardcoded today. That is common for Firebase client apps, but if the team wants environment-based configuration, that migration has not been implemented yet.

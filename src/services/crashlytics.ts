/**
 * Crashlytics Service
 *
 * Thin wrapper around @react-native-firebase/crashlytics.
 * All functions silently no-op if Crashlytics is unavailable
 * (Expo Go, JS-only builds, unit tests).
 *
 * Privacy rules enforced here:
 *  - setUser() accepts only a Firebase UID — never email or display name.
 *  - recordError() strips no-op error values safely before forwarding.
 *  - testCrash() is ONLY callable in __DEV__ builds and must never be
 *    reachable in production App Store / Play Store binaries.
 */

import {
  crash,
  getCrashlytics,
  log,
  recordError,
  setAttribute,
  setUserId,
} from '@react-native-firebase/crashlytics';

// ─── Internal helper ──────────────────────────────────────────────────────────

const safe = async (fn: () => void | Promise<void>): Promise<void> => {
  try {
    await fn();
  } catch {
    // Crashlytics calls must never crash the app
  }
};

// ─── User identity ────────────────────────────────────────────────────────────

/**
 * Associate subsequent crash reports with a Firebase UID.
 * Only pass the UID — never email, name, or other PII.
 */
export const setCrashlyticsUser = (uid: string): void => {
  safe(() => setUserId(getCrashlytics(), uid));
};

/** Clear the user identity from Crashlytics on sign-out. */
export const clearCrashlyticsUser = (): void => {
  safe(() => setUserId(getCrashlytics(), ''));
};

// ─── Breadcrumb logging ───────────────────────────────────────────────────────

/**
 * Log a breadcrumb message visible in the Crashlytics report before a crash.
 * Keep messages concise and free of PII.
 */
export const logCrashlytics = (message: string): void => {
  safe(() => log(getCrashlytics(), message));
};

// ─── Error recording ──────────────────────────────────────────────────────────

/**
 * Record a handled (non-fatal) error in Crashlytics.
 * The error will appear in the Non-Fatal Issues tab in the Firebase Console.
 *
 * @param error   - The caught error object. If it is not an Error instance,
 *                  it will be wrapped so Crashlytics receives a proper stack.
 * @param context - Optional short label shown as a Crashlytics custom key,
 *                  e.g. 'sign_in', 'save_outfit'. Do not include user data.
 */
export const recordCrashlyticsError = (
  error: unknown,
  context?: string,
): void => {
  safe(async () => {
    const instance = getCrashlytics();

    // Attach the context label as a custom key if provided
    if (context) {
      await setAttribute(instance, 'error_context', context);
    }

    // Crashlytics requires a native Error object with a stack trace
    const nativeError =
      error instanceof Error
        ? error
        : new Error(typeof error === 'string' ? error : 'Unknown error');

    recordError(instance, nativeError);
  });
};

// ─── Custom attributes ────────────────────────────────────────────────────────

/**
 * Set an arbitrary custom key/value pair visible in the Crashlytics report.
 * Do not use for PII.
 */
export const setCrashlyticsAttribute = (key: string, value: string): void => {
  safe(() => setAttribute(getCrashlytics(), key, value));
};

// ─── Test crash (DEV ONLY) ────────────────────────────────────────────────────

/**
 * Trigger a native crash to verify Crashlytics is working.
 *
 * THIS FUNCTION IS STRICTLY DEV-ONLY.
 * It is guarded by __DEV__ and will throw at runtime if called in a
 * production build — never expose it through any user-accessible UI in
 * a production App Store / Play Store release.
 */
export const triggerTestCrash = (): void => {
  if (!__DEV__) {
    // Hard guard: refuse to run in production binaries
    console.warn('[Crashlytics] triggerTestCrash() called outside __DEV__. Ignoring.');
    return;
  }
  // This call intentionally crashes the app for verification purposes
  crash(getCrashlytics());
};

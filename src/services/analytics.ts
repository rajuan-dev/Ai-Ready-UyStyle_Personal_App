/**
 * Analytics Service
 *
 * Thin wrapper around @react-native-firebase/analytics.
 * All event functions are safe to call unconditionally — they silently no-op
 * if analytics is unavailable (Expo Go, unit tests, etc.).
 *
 * Privacy rules enforced here:
 *  - No email addresses, display names, or image URLs in event parameters.
 *  - Only anonymous counts and category strings are sent.
 *  - User identification uses Firebase UID only (not email or name).
 */

import analytics from '@react-native-firebase/analytics';

// ─── Internal helper ──────────────────────────────────────────────────────────

const safe = async (fn: () => Promise<void>): Promise<void> => {
  try {
    await fn();
  } catch {
    // Never crash the app because of an analytics call
  }
};

// ─── User identity ────────────────────────────────────────────────────────────

/** Set the Firebase Analytics user ID. Only the UID is used — never email or name. */
export const setAnalyticsUser = (uid: string): void => {
  safe(() => analytics().setUserId(uid));
};

/** Clear the Analytics user ID on sign-out. */
export const clearAnalyticsUser = (): void => {
  safe(() => analytics().setUserId(null as any));
};

// ─── Onboarding ───────────────────────────────────────────────────────────────

/** Fired when the user completes the last onboarding slide and proceeds to sign-in. */
export const logOnboardingComplete = (): void => {
  safe(() => analytics().logEvent('onboarding_complete'));
};

// ─── Closet ───────────────────────────────────────────────────────────────────

/**
 * Fired when a new item is successfully saved to the closet.
 * @param category - The clothing category string (e.g. "Tops"). No PII.
 */
export const logAddClosetItem = (category: string): void => {
  safe(() =>
    analytics().logEvent('add_closet_item', {
      item_category: category,
    }),
  );
};

// ─── Outfit builder ───────────────────────────────────────────────────────────

/**
 * Fired when the user presses Preview on the Combine screen,
 * indicating they have composed an outfit and want to review it.
 * @param itemCount - Number of slots filled (no item details).
 */
export const logGenerateOutfit = (itemCount: number): void => {
  safe(() =>
    analytics().logEvent('generate_outfit', {
      item_count: itemCount,
    }),
  );
};

/**
 * Fired when the user returns from PreviewScreen to CombineScreen
 * to rearrange their outfit combination.
 */
export const logBuildAnother = (): void => {
  safe(() => analytics().logEvent('build_another'));
};

/**
 * Fired when the user navigates back to try different item combinations
 * from the preview screen using the Edit Outfit flow.
 */
export const logTryDifferentCombinations = (): void => {
  safe(() => analytics().logEvent('try_different_combinations'));
};

// ─── Preview / Save ───────────────────────────────────────────────────────────

/**
 * Fired when the user confirms and saves an outfit ("Wear This" / "Confirm Look").
 * @param itemCount - Number of items in the outfit.
 */
export const logWearThis = (itemCount: number): void => {
  safe(() =>
    analytics().logEvent('wear_this', {
      item_count: itemCount,
    }),
  );
};

/**
 * Fired when an outfit is successfully saved to Firestore.
 * @param itemCount - Number of items in the outfit.
 * @param isEdit    - Whether this was an update to an existing outfit.
 */
export const logSaveOutfit = (itemCount: number, isEdit: boolean): void => {
  safe(() =>
    analytics().logEvent('save_outfit', {
      item_count: itemCount,
      is_edit: isEdit ? 1 : 0,
    }),
  );
};

// ─── Share ────────────────────────────────────────────────────────────────────

/**
 * Fired when the user successfully triggers the system share sheet for a look.
 * @param itemCount - Number of items in the shared outfit.
 */
export const logShareLook = (itemCount: number): void => {
  safe(() =>
    analytics().logEvent('share_look', {
      item_count: itemCount,
    }),
  );
};

// ─── Favorites ────────────────────────────────────────────────────────────────

/** Fired when the user hearts / favorites a closet item. */
export const logFavoriteLook = (): void => {
  safe(() => analytics().logEvent('favorite_look'));
};

/** Fired when the user un-hearts / removes a closet item from favorites. */
export const logUnfavoriteLook = (): void => {
  safe(() => analytics().logEvent('unfavorite_look'));
};

// ─── Style preferences ────────────────────────────────────────────────────────

/**
 * Fired when the user saves their style preferences.
 * @param styleCount    - Number of styles selected.
 * @param occasionCount - Number of occasions selected.
 * @param colorCount    - Number of colors selected.
 */
export const logUpdateStylePreferences = (
  styleCount: number,
  occasionCount: number,
  colorCount: number,
): void => {
  safe(() =>
    analytics().logEvent('update_style_preferences', {
      style_count:    styleCount,
      occasion_count: occasionCount,
      color_count:    colorCount,
    }),
  );
};

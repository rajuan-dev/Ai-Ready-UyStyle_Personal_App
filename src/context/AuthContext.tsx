import React, { createContext, useContext, useEffect, useState } from 'react';
import { getApp } from '../firebase/app';
import { getAuth, onAuthStateChanged, reload } from '../firebase/auth';
import type { FirebaseAuthTypes } from '../firebase/auth';
import { doc, getDoc, getFirestore, serverTimestamp, setDoc } from '../firebase/firestore';
import {
  clearPendingRegistration,
  getHasAccountFlag,
  getPendingRegistration,
  setHasAccountFlag,
} from '../auth/authStorage';
import {
  setCrashlyticsUser,
  clearCrashlyticsUser,
  recordCrashlyticsError,
  setCrashlyticsAttribute,
} from '../services';

type AuthContextType = {
  user: FirebaseAuthTypes.User | null;
  loading: boolean;
  hasAccount: boolean;
  refreshUser: () => Promise<FirebaseAuthTypes.User | null>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  hasAccount: false,
  refreshUser: async () => null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccount, setHasAccount] = useState(false);

  const ensureUserProfile = async (firebaseUser: FirebaseAuthTypes.User) => {
    if (!firebaseUser.emailVerified) return;

    const db = getFirestore(getApp());
    const userRef = doc(db, 'users', firebaseUser.uid);
    const existingProfile = await getDoc(userRef);
    const normalizedEmail = firebaseUser.email?.trim().toLowerCase() || '';
    const pendingProfile = await getPendingRegistration();

    const profilePayload: Record<string, unknown> = {
      fullName: firebaseUser.displayName?.trim() || '',
      email: normalizedEmail,
    };

    if (
      pendingProfile &&
      pendingProfile.uid === firebaseUser.uid &&
      pendingProfile.email === normalizedEmail
    ) {
      profilePayload.fullName = pendingProfile.fullName;
    }

    if (!existingProfile.exists()) {
      profilePayload.createdAt = serverTimestamp();
    }

    await setDoc(userRef, profilePayload, { merge: true });

    if (
      pendingProfile &&
      pendingProfile.uid === firebaseUser.uid &&
      pendingProfile.email === normalizedEmail
    ) {
      await clearPendingRegistration();
    }
  };

  useEffect(() => {
    const checkAccount = async () => {
      const flag = await getHasAccountFlag();
      if (flag) {
        setHasAccount(true);
      }
    };

    checkAccount();

    const auth = getAuth(getApp());
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser?.emailVerified) {
        await setHasAccountFlag(true);
        setHasAccount(true);

        // Associate crash reports with the authenticated user (UID only — no PII)
        setCrashlyticsUser(firebaseUser.uid);
        setCrashlyticsAttribute('email_verified', 'true');

        try {
          await ensureUserProfile(firebaseUser);
        } catch (error) {
          console.error('[AuthContext] Failed to ensure user profile:', error);
          recordCrashlyticsError(error, 'ensure_user_profile');
        }
      } else {
        // User is signed out or unverified — clear Crashlytics identity
        clearCrashlyticsUser();
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const refreshUser = async () => {
    const auth = getAuth(getApp());
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setUser(null);
      return null;
    }

    await reload(currentUser);
    const refreshedUser = auth.currentUser;
    setUser(refreshedUser);

    if (refreshedUser?.emailVerified) {
      setCrashlyticsUser(refreshedUser.uid);
      try {
        await ensureUserProfile(refreshedUser);
      } catch (error) {
        console.error('[AuthContext] Failed to ensure user profile after refresh:', error);
        recordCrashlyticsError(error, 'ensure_user_profile_refresh');
      }
    }

    return refreshedUser;
  };

  return (
    <AuthContext.Provider value={{ user, loading, hasAccount, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

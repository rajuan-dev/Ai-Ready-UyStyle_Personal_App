import React, { createContext, useContext, useEffect, useState } from 'react';
import { getApp } from '@react-native-firebase/app';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthContextType = {
  user:       FirebaseAuthTypes.User | null;
  loading:    boolean;
  hasAccount: boolean; // আগে account ছিল কিনা
};

const AuthContext = createContext<AuthContextType>({
  user:       null,
  loading:    true,
  hasAccount: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user,       setUser]       = useState<FirebaseAuthTypes.User | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [hasAccount, setHasAccount] = useState(false);

  useEffect(() => {
    const checkAccount = async () => {
      const flag = await AsyncStorage.getItem('hasAccount');
      if (flag === 'true') setHasAccount(true);
    };
    checkAccount();

    const auth        = getAuth(getApp());
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      // User login/signup করলে flag save করো
      if (firebaseUser) {
        await AsyncStorage.setItem('hasAccount', 'true');
        setHasAccount(true);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, hasAccount }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
import AsyncStorage from '@react-native-async-storage/async-storage';

export const HAS_ACCOUNT_KEY = 'hasAccount';
export const PENDING_REGISTRATION_KEY = 'pendingRegistration';

export type PendingRegistration = {
  uid: string;
  fullName: string;
  email: string;
};

export const getHasAccountFlag = async () => {
  const value = await AsyncStorage.getItem(HAS_ACCOUNT_KEY);
  return value === 'true';
};

export const setHasAccountFlag = async (value: boolean) => {
  if (value) {
    await AsyncStorage.setItem(HAS_ACCOUNT_KEY, 'true');
    return;
  }

  await AsyncStorage.removeItem(HAS_ACCOUNT_KEY);
};

export const getPendingRegistration = async (): Promise<PendingRegistration | null> => {
  const value = await AsyncStorage.getItem(PENDING_REGISTRATION_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as PendingRegistration;
  } catch {
    await AsyncStorage.removeItem(PENDING_REGISTRATION_KEY);
    return null;
  }
};

export const setPendingRegistration = async (registration: PendingRegistration) => {
  await AsyncStorage.setItem(PENDING_REGISTRATION_KEY, JSON.stringify(registration));
};

export const clearPendingRegistration = async () => {
  await AsyncStorage.removeItem(PENDING_REGISTRATION_KEY);
};

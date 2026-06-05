import type { User as FirebaseUser } from 'firebase/auth';

export { getAuth } from './client';
export {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
} from 'firebase/auth';

export namespace FirebaseAuthTypes {
  export type User = FirebaseUser;
}

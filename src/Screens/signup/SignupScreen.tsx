import { Eye, EyeOff } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getApp } from '../../firebase/app';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from '../../firebase/auth';
import { getPendingRegistration, setPendingRegistration } from '../../auth/authStorage';
import { styles } from './style';
import { recordCrashlyticsError } from '../../services';

const EyeIcon = ({ visible }: { visible: boolean }) => (
  <View>
    {visible
      ? <Eye color={'#717C82'} size={22} />
      : <EyeOff color={'#717C82'} size={22} />}
  </View>
);

const SignupScreen = ({ navigation }: any) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSignup = async () => {
    if (!validate()) return;

    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();
    try {
      const authInstance = getAuth(getApp());
      const userCredential = await createUserWithEmailAndPassword(
        authInstance,
        normalizedEmail,
        password
      );

      try {
        await updateProfile(userCredential.user, {
          displayName: fullName.trim(),
        });

        await setPendingRegistration({
          uid: userCredential.user.uid,
          email: normalizedEmail,
          fullName: fullName.trim(),
        });

        await sendEmailVerification(userCredential.user);
      } catch (profileError) {
        console.error('[Signup] verification setup error:', profileError);
        Alert.alert(
          'Verification email failed',
          'We created your auth account, but could not complete the verification setup. Please sign in again and resend the email.'
        );
      }

      navigation.replace('verifyEmail');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        const auth = getAuth(getApp());
        const pendingRegistration = await getPendingRegistration();
        const isCurrentPendingUser = auth.currentUser?.email?.trim().toLowerCase() === normalizedEmail
          && !auth.currentUser?.emailVerified;
        const isStoredPendingUser = pendingRegistration?.email === normalizedEmail;

        if (isCurrentPendingUser || isStoredPendingUser) {
          if (auth.currentUser && !auth.currentUser.emailVerified) {
            await sendEmailVerification(auth.currentUser).catch(() => null);
          }

          navigation.replace('verifyEmail');
        } else {
          Alert.alert('Error', 'Email already registered. Please log in or reset your password.');
        }
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Error', 'Please enter a valid email address');
      } else if (error.code === 'auth/weak-password') {
        Alert.alert('Error', 'Please choose a stronger password.');
      } else if (error.code === 'auth/too-many-requests') {
        Alert.alert('Error', 'Too many attempts. Please wait a moment and try again.');
      } else if (error.code === 'auth/network-request-failed') {
        Alert.alert('Error', 'Network error. Please check your internet connection and try again.');
      } else {
        // Unexpected error — record as non-fatal in Crashlytics
        recordCrashlyticsError(error, 'sign_up');
        Alert.alert('Error', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <KeyboardAvoidingView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>Start building your digital wardrobe today.</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Sarah Johnson"
                  placeholderTextColor="#b0b8c8"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  autoCorrect={false}
                  autoComplete="name"
                  textContentType="name"
                  importantForAutofill="yes"
                  returnKeyType="next"
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor="#b0b8c8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  importantForAutofill="yes"
                  returnKeyType="next"
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.input, styles.inputWithIcon]}
                  placeholder="••••••••"
                  placeholderTextColor="#b0b8c8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="new-password"
                  textContentType="newPassword"
                  importantForAutofill="yes"
                  passwordRules="minlength: 6;"
                  returnKeyType="next"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  <EyeIcon visible={showPassword} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.input, styles.inputWithIcon]}
                  placeholder="••••••••"
                  placeholderTextColor="#b0b8c8"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirm}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="new-password"
                  textContentType="newPassword"
                  importantForAutofill="yes"
                  passwordRules="minlength: 6;"
                  returnKeyType="done"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirm(!showConfirm)}
                  activeOpacity={0.7}
                >
                  <EyeIcon visible={showConfirm} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.spacer} />

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.nextButton, loading && { opacity: 0.7 }]}
              activeOpacity={0.85}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.nextButtonText}>Create Account</Text>}
            </TouchableOpacity>

            <Text style={styles.termsText2}>
              By creating an account, you agree to our{' '}
              <Text
                style={styles.termsLink}
                onPress={() => navigation.navigate('termsandconditions')}
              >
                Terms of Service
              </Text>{' '}
              and{' '}
              <Text
                style={styles.termsLink}
                onPress={() => navigation.navigate('privacypolicy')}
              >
                Privacy Policy
              </Text>.
            </Text>

            <Text style={styles.termsText}>
              Already have an account?{' '}
              <Text
                style={styles.termsLink}
                onPress={() => navigation.navigate('signin')}
              >
                Sign In
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignupScreen;

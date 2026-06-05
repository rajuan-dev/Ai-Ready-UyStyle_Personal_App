import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getApp } from '../../firebase/app';
import { getAuth, sendEmailVerification, signOut, deleteUser, sendPasswordResetEmail } from '../../firebase/auth';
import { clearPendingRegistration, setHasAccountFlag } from '../../auth/authStorage';
import { useAuth } from '../../context';
import { Mail, CheckCircle2, ArrowRight, RefreshCcw, LogOut, ShieldCheck, MailCheck, ChevronLeft } from 'lucide-react-native';

const VerifyEmailScreen = ({ route, navigation }: any) => {
  const { user, refreshUser } = useAuth();
  
  const isPasswordReset = route?.params?.isPasswordReset || false;
  const passedEmail = route?.params?.email || '';

  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const emailText = useMemo(() => user?.email || passedEmail || 'your email address', [user?.email, passedEmail]);

  const handleResend = async () => {
    setResending(true);
    try {
      if (isPasswordReset) {
        if (!passedEmail) return;
        const auth = getAuth(getApp());
        await sendPasswordResetEmail(auth, passedEmail);
        Alert.alert('Link Sent', `A new password reset link has been sent to ${emailText}. Please check your spam folder.`);
      } else {
        if (!user) return;
        await sendEmailVerification(user);
        Alert.alert('Verification Sent', `A new verification link has been sent to ${emailText}. Please check your spam folder.`);
      }
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Unable to resend email. Please try again later.');
    } finally {
      setResending(false);
    }
  };

  const handlePrimaryAction = async () => {
    if (isPasswordReset) {
      navigation.navigate('signin');
      return;
    }

    setChecking(true);
    try {
      const refreshedUser = await refreshUser();

      if (refreshedUser?.emailVerified) {
        Alert.alert('Success', 'Your email has been successfully verified.');
        return;
      }

      Alert.alert(
        'Still Pending',
        'We couldn\'t verify your email yet. Please make sure you clicked the link in the email we sent you.'
      );
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Something went wrong while checking your status.');
    } finally {
      setChecking(false);
    }
  };

  const handleSignOut = async () => {
    if (signingOut) {
      return;
    }

    setSigningOut(true);
    try {
      const auth = getAuth(getApp());
      const currentUser = auth.currentUser;
      await setHasAccountFlag(true);
      await clearPendingRegistration();

      if (currentUser && !currentUser.emailVerified) {
        try {
          await deleteUser(currentUser);
        } catch (error: any) {
          if (error?.code !== 'auth/requires-recent-login') {
            throw error;
          }
        }
      }

      if (auth.currentUser) {
        await signOut(auth);
      }

      navigation.replace('signin');
    } catch (error: any) {
      if (error?.code !== 'auth/no-current-user') {
        Alert.alert('Error', error?.message || 'Failed to sign out.');
      }

      navigation.replace('signin');
    } finally {
      setSigningOut(false);
    }
  };

  const handleBack = () => {
    if (isPasswordReset) {
      navigation.navigate('signin');
    } else {
      handleSignOut();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Top Header with Back Button */}
      <View style={styles.topHeader}>
        <TouchableOpacity 
          onPress={handleBack} 
          style={styles.backButton}
          disabled={signingOut}
        >
          {signingOut ? (
            <ActivityIndicator size="small" color="#0F172A" />
          ) : (
            <ChevronLeft size={28} color="#0F172A" />
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentContainer}>
            <View style={styles.headerIconContainer}>
              <View style={styles.iconCircle}>
                <MailCheck size={48} color="#2563EB" strokeWidth={1.5} />
              </View>
            </View>
            
            <View style={styles.textContainer}>
              <Text style={styles.title}>{isPasswordReset ? 'Check your email' : 'Verify your email'}</Text>
              <Text style={styles.subtitle}>
                We've sent a secure {isPasswordReset ? 'password reset' : 'verification'} link to{'\n'}
                <Text style={styles.emailHighlight}>{emailText}</Text>
              </Text>
            </View>

            <View style={styles.stepsList}>
              <View style={styles.stepItem}>
                <View style={[styles.stepIconWrapper, { backgroundColor: '#EFF6FF' }]}>
                  <Mail size={18} color="#2563EB" />
                </View>
                <View style={styles.stepTextContent}>
                  <Text style={styles.stepTitle}>Check your inbox</Text>
                  <Text style={styles.stepDescription}>Click the link in the email we sent.</Text>
                </View>
              </View>

              <View style={styles.stepItem}>
                <View style={[styles.stepIconWrapper, { backgroundColor: '#F0FDF4' }]}>
                  <ShieldCheck size={18} color="#16A34A" />
                </View>
                <View style={styles.stepTextContent}>
                  <Text style={styles.stepTitle}>{isPasswordReset ? 'Reset password' : 'Activate account'}</Text>
                  <Text style={styles.stepDescription}>{isPasswordReset ? 'Create a new password securely.' : 'Your account will be verified instantly.'}</Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                Can't find the email? Check your spam folder or tap "Resend email" below.
              </Text>
            </View>
          </View>

          <View style={styles.actionGroup}>
            <TouchableOpacity
              style={[styles.primaryButton, checking && styles.disabledButton]}
              onPress={handlePrimaryAction}
              disabled={checking}
              activeOpacity={0.8}
            >
              {checking ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {isPasswordReset ? 'Return to Sign In' : 'I\'ve verified my email'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, resending && styles.disabledButton]}
              onPress={handleResend}
              disabled={resending}
              activeOpacity={0.7}
            >
              {resending ? (
                <ActivityIndicator color="#1E293B" />
              ) : (
                <>
                  <RefreshCcw size={18} color="#1E293B" style={{ marginRight: 8 }} />
                  <Text style={styles.secondaryButtonText}>Resend email</Text>
                </>
              )}
            </TouchableOpacity>

            {!isPasswordReset && (
              <TouchableOpacity
                style={styles.signOutButton}
                onPress={handleSignOut}
                disabled={signingOut}
                activeOpacity={0.6}
              >
                {signingOut ? (
                  <ActivityIndicator color="#64748B" />
                ) : (
                  <>
                    <LogOut size={16} color="#64748B" style={{ marginRight: 6 }} />
                    <Text style={styles.signOutButtonText}>Sign out and use another account</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topHeader: {
    paddingHorizontal: 20,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -10, // Adjust for icon padding
  },
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 32,
    paddingTop: 40,
    paddingBottom: 24,
  },
  contentContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  headerIconContainer: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },
  emailHighlight: {
    color: '#0F172A',
    fontWeight: '700',
  },
  stepsList: {
    width: '100%',
    gap: 16,
    marginBottom: 28,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 2,
  },
  stepIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  stepTextContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 1,
  },
  stepDescription: {
    fontSize: 13,
    color: '#64748B',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 20,
  },
  infoBox: {
    width: '100%',
  },
  infoText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
  actionGroup: {
    marginTop: 'auto',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#F8FAFC',
    height: 54,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  secondaryButtonText: {
    color: '#1E293B',
    fontSize: 15,
    fontWeight: '600',
  },
  signOutButton: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  signOutButtonText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default VerifyEmailScreen;

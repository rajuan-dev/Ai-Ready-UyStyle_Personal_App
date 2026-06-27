import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    ScrollView,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { getApp } from '../../../firebase/app';
import {
    getAuth,
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword,
} from '../../../firebase/auth';
import { recordCrashlyticsError } from '../../../services';

interface FormState {
    currentPassword: string;
    newPassword:     string;
    confirmPassword: string;
}

interface FormErrors {
    currentPassword?: string;
    newPassword?:     string;
    confirmPassword?: string;
    general?:         string;
}

function validate(form: FormState): FormErrors {
    const errors: FormErrors = {};
    if (!form.currentPassword)
        errors.currentPassword = 'Current password is required.';
    if (!form.newPassword) {
        errors.newPassword = 'New password is required.';
    } else if (form.newPassword.length < 8) {
        errors.newPassword = 'Password must be at least 8 characters.';
    } else if (!/[A-Z]/.test(form.newPassword)) {
        errors.newPassword = 'Must contain at least one uppercase letter.';
    } else if (!/[0-9]/.test(form.newPassword)) {
        errors.newPassword = 'Must contain at least one number.';
    } else if (form.currentPassword && form.newPassword === form.currentPassword) {
        errors.newPassword = 'New password must differ from current password.';
    }
    if (!form.confirmPassword) {
        errors.confirmPassword = 'Please confirm your new password.';
    } else if (form.newPassword !== form.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match.';
    }
    return errors;
}

function getStrength(pw: string): { label: string; color: string; score: number } {
    if (!pw) return { label: '', color: '#E2E8F0', score: 0 };
    let score = 0;
    if (pw.length >= 8)            score++;
    if (pw.length >= 12)           score++;
    if (/[A-Z]/.test(pw))         score++;
    if (/[0-9]/.test(pw))         score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { label: 'Weak',   color: '#EF4444', score: 1 };
    if (score <= 3) return { label: 'Fair',   color: '#F59E0B', score: 3 };
    return               { label: 'Strong', color: '#10B981', score: 5 };
}

interface PasswordFieldProps {
    label:        string;
    value:        string;
    onChangeText: (text: string) => void;
    error?:       string;
    placeholder?: string;
}

const PasswordField = React.memo(({ label, value, onChangeText, error, placeholder }: PasswordFieldProps) => {
    const [visible, setVisible] = useState(false);
    return (
        <View style={fieldStyles.wrapper}>
            <Text style={fieldStyles.label}>{label}</Text>
            <View style={[fieldStyles.inputRow, !!error && fieldStyles.inputError]}>
                <TextInput
                    style={fieldStyles.input}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!visible}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="password"
                />
                <TouchableOpacity
                    onPress={() => setVisible(v => !v)}
                    style={fieldStyles.eyeBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    {visible ? <EyeOff size={18} color="#94A3B8" /> : <Eye size={18} color="#94A3B8" />}
                </TouchableOpacity>
            </View>
            {error ? <Text style={fieldStyles.errorText}>{error}</Text> : null}
        </View>
    );
});

const fieldStyles = StyleSheet.create({
    wrapper:    { marginBottom: 22 },
    label:      { fontSize: 13, fontFamily: 'InterSemiBold', color: '#64748B', marginBottom: 8, letterSpacing: 0.3 },
    inputRow: {
        flexDirection: 'row', alignItems: 'center',
        borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 14,
        backgroundColor: '#F8FAFC', paddingHorizontal: 16,
    },
    inputError: { borderColor: '#FCA5A5', backgroundColor: '#FFF8F8' },
    input:      { flex: 1, height: 52, fontSize: 15, fontFamily: 'InterRegular', color: '#1E293B' },
    eyeBtn:     { padding: 4 },
    errorText:  { fontSize: 12, fontFamily: 'InterRegular', color: '#EF4444', marginTop: 6, marginLeft: 2 },
});

const ChangePasswordScreen = () => {
    const navigation = useNavigation();
    const auth = getAuth(getApp());

    const [form, setForm] = useState<FormState>({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [errors,  setErrors]  = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const setField = useCallback((field: keyof FormState) => (value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setErrors(prev => ({ ...prev, [field]: undefined, general: undefined }));
    }, []);

    const handleSubmit = useCallback(async () => {
        const validationErrors = validate(form);
        if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
        const currentUser = auth.currentUser;
        if (!currentUser?.email) { setErrors({ general: 'No authenticated user. Please log in again.' }); return; }
        setLoading(true);
        setErrors({});
        try {
            const credential = EmailAuthProvider.credential(currentUser.email, form.currentPassword);
            await reauthenticateWithCredential(currentUser, credential);
            await updatePassword(currentUser, form.newPassword);
            setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setSuccess(true);
        } catch (err: any) {
            const code: string = err?.code ?? '';
            if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
                setErrors({ currentPassword: 'Current password is incorrect.' });
            } else if (code === 'auth/too-many-requests') {
                setErrors({ general: 'Too many attempts. Please wait and try again.' });
            } else if (code === 'auth/requires-recent-login') {
                setErrors({ general: 'Session expired. Please log out and log in again.' });
            } else if (code === 'auth/weak-password') {
                setErrors({ newPassword: 'Password is too weak. Choose a stronger one.' });
            } else {
                recordCrashlyticsError(err, 'change_password');
                setErrors({ general: 'Something went wrong. Please try again.' });
            }
        } finally {
            setLoading(false);
        }
    }, [form]);

    const strength = getStrength(form.newPassword);

    if (success) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                <View style={styles.successContainer}>
                    <View style={styles.successIconWrap}>
                        <Text style={styles.successIconText}>✓</Text>
                    </View>
                    <Text style={styles.successTitle}>Password Updated!</Text>
                    <Text style={styles.successSub}>Your password has been changed successfully.</Text>
                    <TouchableOpacity style={styles.successBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
                        <Text style={styles.successBtnText}>Back to Settings</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
                    <ArrowLeft size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Change Password</Text>
                <View style={{ width: 40 }} />
            </View>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <Text style={styles.subtitle}>
                        Enter your current password to verify your identity, then set a new one.
                    </Text>
                    {errors.general ? (
                        <View style={styles.errorBanner}>
                            <Text style={styles.errorBannerText}>{errors.general}</Text>
                        </View>
                    ) : null}
                    <PasswordField
                        label="Current Password"
                        value={form.currentPassword}
                        onChangeText={setField('currentPassword')}
                        error={errors.currentPassword}
                        placeholder="Enter your current password"
                    />
                    <PasswordField
                        label="New Password"
                        value={form.newPassword}
                        onChangeText={setField('newPassword')}
                        error={errors.newPassword}
                        placeholder="At least 8 characters"
                    />
                    {form.newPassword.length > 0 ? (
                        <View style={styles.strengthWrap}>
                            <View style={styles.strengthBars}>
                                {[1, 2, 3, 4, 5].map(i => (
                                    <View key={i} style={[styles.strengthBar, { backgroundColor: i <= strength.score ? strength.color : '#E2E8F0' }]} />
                                ))}
                            </View>
                            <Text style={[styles.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
                        </View>
                    ) : null}
                    <PasswordField
                        label="Confirm New Password"
                        value={form.confirmPassword}
                        onChangeText={setField('confirmPassword')}
                        error={errors.confirmPassword}
                        placeholder="Repeat your new password"
                    />
                    <TouchableOpacity
                        style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                        activeOpacity={0.85}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Update Password</Text>}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea:      { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 15,
    },
    headerTitle:   { fontSize: 18, fontFamily: 'InterBold', color: '#0F1729' },
    backBtn:       { width: 40, height: 40, justifyContent: 'center' },
    scrollContent: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 48 },
    subtitle:      { fontSize: 14, fontFamily: 'InterRegular', color: '#64748B', lineHeight: 21, marginBottom: 32 },
    errorBanner: {
        backgroundColor: '#FFF5F5', borderWidth: 1, borderColor: '#FCA5A5',
        borderRadius: 12, padding: 14, marginBottom: 24,
    },
    errorBannerText: { fontSize: 13, fontFamily: 'InterRegular', color: '#DC2626', lineHeight: 18 },
    strengthWrap:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: -14, marginBottom: 22 },
    strengthBars:  { flexDirection: 'row', gap: 5, flex: 1 },
    strengthBar:   { flex: 1, height: 4, borderRadius: 2 },
    strengthLabel: { fontSize: 12, fontFamily: 'InterSemiBold', minWidth: 42 },
    submitBtn: {
        backgroundColor: '#2869BD', borderRadius: 14, height: 54,
        alignItems: 'center', justifyContent: 'center', marginTop: 8,
        shadowColor: '#2869BD', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
    },
    submitBtnDisabled: { opacity: 0.6, shadowOpacity: 0 },
    submitBtnText:     { fontSize: 16, fontFamily: 'InterSemiBold', color: '#fff', letterSpacing: 0.3 },
    successContainer:  { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 16 },
    successIconWrap: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: '#D1FAE5',
        alignItems: 'center', justifyContent: 'center', marginBottom: 8,
    },
    successIconText: { fontSize: 36, color: '#10B981' },
    successTitle:    { fontSize: 24, fontFamily: 'InterBold', color: '#1E293B' },
    successSub:      { fontSize: 15, fontFamily: 'InterRegular', color: '#64748B', textAlign: 'center', lineHeight: 22 },
    successBtn:      { marginTop: 8, backgroundColor: '#2869BD', paddingHorizontal: 32, paddingVertical: 15, borderRadius: 14 },
    successBtnText:  { fontSize: 15, fontFamily: 'InterSemiBold', color: '#fff' },
});

export default ChangePasswordScreen;
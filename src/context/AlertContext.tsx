import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Dimensions,
    StatusBar,
    Easing,
} from 'react-native';
import { Check, X, Info, AlertCircle, LucideIcon } from 'lucide-react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

type AlertType = 'success' | 'error' | 'confirm' | 'info';

type AlertOptions = {
    title: string;
    message: string;
    type?: AlertType;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
};

type AlertContextType = {
    showAlert: (options: AlertOptions) => void;
    showSuccess: (title: string, message: string, onConfirm?: () => void) => void;
    showError: (title: string, message: string) => void;
    showConfirm: (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => void;
    hideAlert: () => void;
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
    const [visible, setVisible] = useState(false);
    const [options, setOptions] = useState<AlertOptions | null>(null);

    // Animation variables
    const scaleAnim   = useRef(new Animated.Value(0.92)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const iconScale   = useRef(new Animated.Value(0)).current;

    const showAlert = (opts: AlertOptions) => {
        setOptions(opts);
        setVisible(true);
    };

    const showSuccess = (title: string, message: string, onConfirm?: () => void) => {
        showAlert({ title, message, type: 'success', onConfirm });
    };

    const showError = (title: string, message: string) => {
        showAlert({ title, message, type: 'error' });
    };

    const showConfirm = (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => {
        showAlert({ title, message, type: 'confirm', onConfirm, onCancel, confirmText: 'Yes', cancelText: 'No' });
    };

    const hideAlert = () => {
        // Animate out
        Animated.parallel([
            Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 150,
                useNativeDriver: true,
                easing: Easing.out(Easing.ease),
            }),
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setVisible(false);
            setOptions(null);
        });
    };

    useEffect(() => {
        if (visible) {
            // Reset and Animate in
            scaleAnim.setValue(0.9);
            opacityAnim.setValue(0);
            iconScale.setValue(0);

            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 8,
                    tension: 50,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 220,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.ease),
                }),
            ]).start();

            // Delay icon bounce for beautiful sequencing
            setTimeout(() => {
                Animated.spring(iconScale, {
                    toValue: 1,
                    friction: 6,
                    tension: 80,
                    useNativeDriver: true,
                }).start();
            }, 100);
        }
    }, [visible]);

    const handleConfirm = () => {
        if (options?.onConfirm) options.onConfirm();
        hideAlert();
    };

    const handleCancel = () => {
        if (options?.onCancel) options.onCancel();
        hideAlert();
    };

    // Resolve styling and icon based on type
    const getTheme = (type?: AlertType) => {
        switch (type) {
            case 'error':
                return {
                    bg: '#FEF2F2',
                    color: '#EF4444',
                    Icon: AlertCircle,
                };
            case 'confirm':
                return {
                    bg: '#EFF6FF',
                    color: '#2869BD',
                    Icon: Info,
                };
            case 'info':
                return {
                    bg: '#F8FAFC',
                    color: '#64748B',
                    Icon: Info,
                };
            case 'success':
            default:
                return {
                    bg: '#ECFDF5',
                    color: '#10B981',
                    Icon: Check,
                };
        }
    };

    const theme = getTheme(options?.type);
    const ModalIcon = theme.Icon;

    return (
        <AlertContext.Provider value={{ showAlert, showSuccess, showError, showConfirm, hideAlert }}>
            {children}

            <Modal
                transparent
                visible={visible}
                animationType="none"
                onRequestClose={hideAlert}
            >
                {/* Background Overlay */}
                <Animated.View style={[s.overlay, { opacity: opacityAnim }]}>
                    <TouchableOpacity
                        style={StyleSheet.absoluteFill}
                        activeOpacity={1}
                        onPress={options?.type !== 'confirm' ? hideAlert : undefined}
                    />
                </Animated.View>

                {/* Dialog Container */}
                <View style={s.container} pointerEvents="box-none">
                    <Animated.View
                        style={[
                            s.card,
                            {
                                opacity: opacityAnim,
                                transform: [{ scale: scaleAnim }],
                            },
                        ]}
                    >
                        {/* Header Decorative Circle */}
                        <Animated.View
                            style={[
                                s.iconCircle,
                                {
                                    backgroundColor: theme.bg,
                                    transform: [{ scale: iconScale }],
                                },
                            ]}
                        >
                            <ModalIcon size={28} color={theme.color} strokeWidth={3} />
                        </Animated.View>

                        {/* Text Content */}
                        <Text style={s.title}>{options?.title || 'Notice'}</Text>
                        <Text style={s.message}>{options?.message || ''}</Text>

                        {/* Actions Footer */}
                        <View style={s.actions}>
                            {options?.type === 'confirm' ? (
                                <View style={s.row}>
                                    <TouchableOpacity
                                        style={[s.btn, s.btnCancel]}
                                        onPress={handleCancel}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={s.btnTextCancel}>{options.cancelText || 'Cancel'}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[s.btn, s.btnConfirm, { backgroundColor: '#0F1729' }]}
                                        onPress={handleConfirm}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={s.btnTextConfirm}>{options.confirmText || 'Confirm'}</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    style={[
                                        s.btn,
                                        s.btnFull,
                                        { backgroundColor: options?.type === 'error' ? '#EF4444' : '#0F1729' }
                                    ]}
                                    onPress={handleConfirm}
                                    activeOpacity={0.8}
                                >
                                    <Text style={s.btnTextConfirm}>{options?.confirmText || 'Great'}</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        </AlertContext.Provider>
    );
};

export const useAppAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAppAlert must be used within an AlertProvider');
    }
    return context;
};

const s = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15, 23, 41, 0.45)',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    card: {
        width: '100%',
        maxWidth: 340,
        backgroundColor: '#fff',
        borderRadius: 28,
        paddingTop: 32,
        paddingBottom: 24,
        paddingHorizontal: 24,
        alignItems: 'center',
        shadowColor: '#0F1729',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 10,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        fontFamily: 'InterBold',
        color: '#0F1729',
        textAlign: 'center',
        marginBottom: 8,
    },
    message: {
        fontSize: 14,
        fontWeight: '400',
        fontFamily: 'InterRegular',
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 28,
        paddingHorizontal: 4,
    },
    actions: {
        width: '100%',
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    btn: {
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnFull: {
        width: '100%',
    },
    btnConfirm: {
        flex: 1,
    },
    btnCancel: {
        flex: 1,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        backgroundColor: '#fff',
    },
    btnTextConfirm: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
        fontFamily: 'InterSemiBold',
    },
    btnTextCancel: {
        color: '#64748B',
        fontSize: 15,
        fontWeight: '600',
        fontFamily: 'InterSemiBold',
    },
});

import { Href, router } from 'expo-router';
import { FormikHelpers, useFormikContext } from 'formik';
import React, { useRef, useState } from 'react';
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
    View,
} from 'react-native';

import AppErrorMessage from '@/components/form/AppErrorMessage';
import AppForm from '@/components/form/AppForm';
import AppFormField from '@/components/form/AppFormField';
import FormLoader from '@/components/form/FormLoader';
import SubmitButton from '@/components/form/SubmitButton';
import ToggleField from '@/components/form/ToggleField';
import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { useAuth } from '@/context/AuthContext';
import { SignupFormValues, SignupValidationSchema } from '@/data/authValidation';
import { SignupRequest } from '@/types/auth.types';

const extractFirstErrorText = (value: unknown): string | null => {
    if (typeof value === 'string') return value;

    if (Array.isArray(value)) {
        for (const item of value) {
            const found = extractFirstErrorText(item);
            if (found) return found;
        }
        return null;
    }

    if (value && typeof value === 'object') {
        for (const nested of Object.values(value as Record<string, unknown>)) {
            const found = extractFirstErrorText(nested);
            if (found) return found;
        }
    }

    return null;
};

const normalizeBackendData = (value: unknown): unknown => {
    if (typeof value !== 'string') return value;
    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
};

const getNestedValue = (source: unknown, path: string[]): unknown => {
    let current: unknown = source;
    for (const key of path) {
        if (!current || typeof current !== 'object' || !(key in (current as Record<string, unknown>))) {
            return undefined;
        }
        current = (current as Record<string, unknown>)[key];
    }
    return current;
};

const SignupFormLoader = () => {
    const { isSubmitting } = useFormikContext<SignupFormValues>();
    return <FormLoader visible={isSubmitting} message="Creating your member account..." />;
};

const TermsError = () => {
    const { errors, touched } = useFormikContext<SignupFormValues>();
    return <AppErrorMessage error={errors.agree_to_terms as string} visible={Boolean(touched.agree_to_terms)} />;
};

const SignupScreen = () => {
    const colors = useColors();
    const { signup } = useAuth();
    const scrollViewRef = useRef<ScrollView>(null);
    const [apiError, setApiError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    React.useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

        const showSub = Keyboard.addListener(showEvent, (event) => {
            setKeyboardHeight(event.endCoordinates.height);
        });
        const hideSub = Keyboard.addListener(hideEvent, () => {
            setKeyboardHeight(0);
        });

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    const handleSubmit = async (
        values: SignupFormValues,
        { resetForm }: FormikHelpers<SignupFormValues>
    ) => {
        try {
            setApiError('');
            setSuccessMessage('');

            const payload: SignupRequest = {
                email: values.email.trim(),
                password: values.password,
                re_password: values.confirm_password,
                first_name: values.first_name.trim(),
                last_name: values.last_name.trim(),
                phone: values.phone.trim(),
                country: values.country.trim(),
                date_of_birth: values.date_of_birth,
                agree_to_terms: values.agree_to_terms,
            };

            await signup(payload);

            setSuccessMessage('Account created. Enter the verification code to continue.');
            resetForm();
            router.replace({
                pathname: '/(auth)/verify-code',
                params: { email: payload.email },
            });
        } catch (error: any) {
            const toErrorPreview = (value: unknown): string | unknown => {
                if (typeof value === 'string') return value.slice(0, 500);
                try {
                    return JSON.stringify(value).slice(0, 500);
                } catch {
                    return value;
                }
            };

            const logPayload = {
                message: error?.message,
                status: error?.response?.status,
                data_preview: toErrorPreview(error?.response?.data),
            };
            console.log(`[SignupScreen] signup failed :: ${JSON.stringify(logPayload)}`);
            console.error(`[SignupScreen] signup failed :: ${JSON.stringify(logPayload)}`);
            const data = normalizeBackendData(error?.response?.data);
            console.log(
                `[SignupScreen] backend response data (raw) :: ${
                    typeof data === 'string' ? data : JSON.stringify(data)
                }`
            );

            const parsedError =
                extractFirstErrorText(getNestedValue(data, ['error', 'details', 'error', 'details', 'email'])) ||
                extractFirstErrorText(getNestedValue(data, ['error', 'details', 'error', 'details'])) ||
                extractFirstErrorText(getNestedValue(data, ['error', 'details', 'error', 'message'])) ||
                extractFirstErrorText(getNestedValue(data, ['error', 'details', 'email'])) ||
                extractFirstErrorText(getNestedValue(data, ['error', 'details'])) ||
                extractFirstErrorText(getNestedValue(data, ['error', 'message'])) ||
                extractFirstErrorText(getNestedValue(data, ['detail'])) ||
                extractFirstErrorText(getNestedValue(data, ['message'])) ||
                extractFirstErrorText(getNestedValue(data, ['error'])) ||
                'Registration failed. Please review your details and try again.';

            setApiError(parsedError);
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        }
    };

    return (
        <Screen>
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 16 : 0}
            >
                <ScrollView
                    ref={scrollViewRef}
                    className="flex-1"
                    contentContainerStyle={{
                        paddingVertical: 24,
                        paddingBottom: Math.max(56, keyboardHeight + 24),
                    }}
                    keyboardShouldPersistTaps="always"
                    keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
                    automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled
                >
                    <View
                        className="rounded-2xl border p-5"
                        style={{ backgroundColor: colors.backgroundAlt, borderColor: colors.border }}
                    >
                        <AppText className="mb-2 text-2xl font-bold">Register as a Member</AppText>
                        <AppText className="mb-5 text-sm" color={colors.textSecondary}>
                            Join our community and complete your account setup.
                        </AppText>

                        <AppForm<SignupFormValues>
                            initialValues={{
                                email: '',
                                phone: '',
                                password: '',
                                confirm_password: '',
                                first_name: '',
                                last_name: '',
                                country: '',
                                date_of_birth: '',
                                agree_to_terms: false,
                            }}
                            onSubmit={handleSubmit}
                            validationSchema={SignupValidationSchema}
                        >
                            <SignupFormLoader />
                            {apiError ? <AppErrorMessage error={apiError} visible /> : null}
                            {successMessage ? (
                                <View
                                    className="rounded-lg p-3"
                                    style={{ backgroundColor: `${colors.success}15`, borderWidth: 1, borderColor: `${colors.success}55` }}
                                >
                                    <AppText className="text-sm font-semibold" color={colors.success}>
                                        {successMessage}
                                    </AppText>
                                </View>
                            ) : null}

                            <AppFormField
                                name="first_name"
                                label="First Name"
                                placeholder="Enter first name"
                                required
                            />
                            <AppFormField
                                name="last_name"
                                label="Last Name"
                                placeholder="Enter last name"
                                required
                            />
                            <AppFormField
                                name="email"
                                label="Email"
                                type="email"
                                placeholder="Enter email"
                                required
                                icon="email"
                            />
                            <AppFormField
                                name="phone"
                                label="Phone Number"
                                type="tel"
                                placeholder="e.g. +1234567890"
                                required
                            />
                            <AppFormField
                                name="country"
                                label="Country"
                                placeholder="Enter country"
                                required
                            />
                            <AppFormField
                                name="date_of_birth"
                                label="Date of Birth"
                                type="date"
                                required
                                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                            />
                            <AppFormField
                                name="password"
                                label="Password"
                                type="password"
                                placeholder="Create a strong password"
                                required
                                icon="eye"
                                iconAria="Toggle password visibility"
                            />
                            <AppFormField
                                name="confirm_password"
                                label="Confirm Password"
                                type="password"
                                placeholder="Confirm your password"
                                required
                                icon="eye"
                                iconAria="Toggle password visibility"
                            />

                            <ToggleField
                                name="agree_to_terms"
                                label="I agree to the terms and conditions"
                                description="You must agree before creating your account."
                            />
                            <TouchableOpacity
                                onPress={() => router.push('/terms' as Href)}
                                accessibilityRole="button"
                                accessibilityLabel="View terms and conditions"
                            >
                                <AppText className="text-sm font-semibold" color={colors.accent}>
                                    Read Terms and Conditions
                                </AppText>
                            </TouchableOpacity>
                            <TermsError />

                            <SubmitButton title="Register as a Member" />
                        </AppForm>

                        <View className="mt-5 flex-row justify-center">
                            <AppText className="text-sm" color={colors.textSecondary}>
                                Already a member?{' '}
                            </AppText>
                            <TouchableOpacity
                                onPress={() => router.replace('/(auth)/login' as Href)}
                                accessibilityRole="button"
                                accessibilityLabel="Go to login"
                            >
                                <AppText className="text-sm font-semibold" color={colors.accent}>
                                    Sign In
                                </AppText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </Screen>
    );
};

export default SignupScreen;

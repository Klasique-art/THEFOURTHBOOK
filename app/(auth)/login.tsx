import { Href, router } from 'expo-router';
import { FormikHelpers, useFormikContext } from 'formik';
import React, { useState } from 'react';
import {
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
import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { useAuth } from '@/context/AuthContext';
import { LoginFormValues, LoginValidationSchema } from '@/data/authValidation';

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

const LoginFormLoader = () => {
    const { isSubmitting } = useFormikContext<LoginFormValues>();
    return <FormLoader visible={isSubmitting} message="Signing you in..." />;
};

const LoginScreen = () => {
    const colors = useColors();
    const { login } = useAuth();
    const [apiError, setApiError] = useState('');

    const handleSubmit = async (
        values: LoginFormValues,
        { resetForm }: FormikHelpers<LoginFormValues>
    ) => {
        try {
            setApiError('');

            await login({
                email: values.email.trim(),
                password: values.password,
            });

            resetForm();
            router.replace('/(tabs)' as Href);
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
            console.log(`[LoginScreen] login failed :: ${JSON.stringify(logPayload)}`);
            console.error(`[LoginScreen] login failed :: ${JSON.stringify(logPayload)}`);
            const data = error?.response?.data;
            const parsedError =
                extractFirstErrorText(data?.error?.details) ||
                extractFirstErrorText(data?.error?.message) ||
                extractFirstErrorText(data?.detail) ||
                extractFirstErrorText(data?.message) ||
                extractFirstErrorText(data?.error) ||
                'Login failed. Please check your email and password.';

            setApiError(parsedError);
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
                    className="flex-1"
                    contentContainerStyle={{ paddingVertical: 24, paddingBottom: 40 }}
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
                        <AppText className="mb-2 text-2xl font-bold">Welcome Back</AppText>
                        <AppText className="mb-5 text-sm" color={colors.textSecondary}>
                            Welcome to The Fourth Book. Sign in to continue.
                        </AppText>

                        <AppForm<LoginFormValues>
                            initialValues={{ email: '', password: '' }}
                            onSubmit={handleSubmit}
                            validationSchema={LoginValidationSchema}
                        >
                            <LoginFormLoader />
                            {apiError ? <AppErrorMessage error={apiError} visible /> : null}

                            <AppFormField<LoginFormValues>
                                name="email"
                                label="Email"
                                type="email"
                                placeholder="Enter your email"
                                required
                                icon="email"
                            />

                            <AppFormField<LoginFormValues>
                                name="password"
                                label="Password"
                                type="password"
                                placeholder="Enter your password"
                                required
                                icon="eye"
                                iconAria="Toggle password visibility"
                            />

                            <SubmitButton title="Sign In" />
                        </AppForm>

                        <View className="mt-5 gap-3">
                            <TouchableOpacity
                                onPress={() => router.push('/(auth)/forgot-password' as Href)}
                                accessibilityRole="button"
                                accessibilityLabel="Go to forgot password"
                            >
                                <AppText className="text-center text-sm font-semibold" color={colors.accent}>
                                    Forgot Password?
                                </AppText>
                            </TouchableOpacity>
                            <View className="flex-row justify-center">
                                <AppText className="text-sm" color={colors.textSecondary}>
                                    No account yet?{' '}
                                </AppText>
                                <TouchableOpacity
                                    onPress={() => router.push('/(auth)/signup' as Href)}
                                    accessibilityRole="button"
                                    accessibilityLabel="Go to signup"
                                >
                                    <AppText className="text-sm font-semibold" color={colors.accent}>
                                        Register as a Member
                                    </AppText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </Screen>
    );
};

export default LoginScreen;

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
import { LoginFormValues, LoginValidationSchema } from '@/data/authValidation';

const LoginFormLoader = () => {
    const { isSubmitting } = useFormikContext<LoginFormValues>();
    return <FormLoader visible={isSubmitting} message="Signing you in..." />;
};

const LoginScreen = () => {
    const colors = useColors();
    const [apiError, setApiError] = useState('');

    const handleSubmit = async (
        values: LoginFormValues,
        { resetForm }: FormikHelpers<LoginFormValues>
    ) => {
        try {
            setApiError('');

            // Simulate backend login for now.
            await new Promise((resolve) => setTimeout(resolve, 900));

            resetForm();
            router.replace('/(tabs)' as Href);
        } catch (error: any) {
            setApiError(
                error?.response?.data?.message ||
                    error?.response?.data?.error ||
                    'Login failed. Please check your email and password.'
            );
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

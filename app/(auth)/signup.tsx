import { Href, router } from 'expo-router';
import { FormikHelpers, useFormikContext } from 'formik';
import React, { useState } from 'react';
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
import { SignupFormValues, SignupValidationSchema } from '@/data/authValidation';

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

            // Simulated request matching API doc payload for POST /auth/register
            const payload = {
                email: values.email.trim(),
                phone: values.phone.trim(),
                password: values.password,
                first_name: values.first_name.trim(),
                last_name: values.last_name.trim(),
                country: values.country.trim(),
                date_of_birth: values.date_of_birth,
                agree_to_terms: values.agree_to_terms,
            };

            await new Promise((resolve) => setTimeout(resolve, 1200));
            void payload;

            setSuccessMessage('Account created successfully. Please verify your email.');
            resetForm();
        } catch (error: any) {
            setApiError(
                error?.response?.data?.message ||
                    error?.response?.data?.error ||
                    'Registration failed. Please review your details and try again.'
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

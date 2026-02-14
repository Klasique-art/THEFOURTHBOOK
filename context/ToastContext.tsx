import React, { createContext, useContext, useMemo, useState } from 'react';
import { View } from 'react-native';

import AppToast, { ToastVariant } from '@/components/ui/AppToast';

type ToastOptions = {
    variant?: ToastVariant;
    duration?: number;
};

type ToastState = {
    message: string;
    variant: ToastVariant;
    duration: number;
    visible: boolean;
};

interface ToastContextType {
    showToast: (message: string, options?: ToastOptions) => void;
    hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const defaultToastState: ToastState = {
    message: '',
    variant: 'info',
    duration: 2800,
    visible: false,
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const [toast, setToast] = useState<ToastState>(defaultToastState);

    const hideToast = () => {
        setToast((prev) => ({ ...prev, visible: false }));
    };

    const showToast = (message: string, options?: ToastOptions) => {
        setToast({
            message,
            variant: options?.variant || 'info',
            duration: options?.duration || 2800,
            visible: true,
        });
    };

    const value = useMemo(
        () => ({
            showToast,
            hideToast,
        }),
        []
    );

    return (
        <ToastContext.Provider value={value}>
            {children}
            <View
                pointerEvents="box-none"
                className="absolute left-0 right-0 top-12 z-50"
            >
                <AppToast
                    visible={toast.visible}
                    message={toast.message}
                    variant={toast.variant}
                    duration={toast.duration}
                    onHide={hideToast}
                />
            </View>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

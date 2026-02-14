import { Ionicons } from '@expo/vector-icons';

// Static quick actions for home screen
export interface QuickAction {
    id: string;
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    route?: string; // Navigation route
    action?: string; // Action identifier for special handling
    color: string;
}

export const homeQuickActions: QuickAction[] = [
    {
        id: '1',
        icon: 'wallet',
        label: 'Make Your Contribution',
        route: '/wallet',
        color: '#F38218', // accent
    },
    {
        id: '3',
        icon: 'people',
        label: 'Invite Your Circle',
        action: 'share',
        color: '#0f0', // success/green
    },
    {
        id: '4',
        icon: 'card',
        label: 'Payment Methods',
        route: '/wallet',
        color: '#0ff', // info/blue
    },
    {
        id: '7',
        icon: 'help-circle',
        label: 'How We Work',
        route: 'how_it_works',
        color: '#eee', // textSecondary
    },
    {
        id: '8',
        icon: 'settings',
        label: 'Settings',
        route: '/(tabs)/profile',
        color: '#666666', // textSecondary
    },
];

// App configuration constants
export const APP_CONFIG = {
    TARGET_MEMBERS: 50000,
    MONTHLY_PRIZE_POOL: 1000000, // $1M USD
    WINNERS_PER_DRAW: 5,
    CONTRIBUTION_AMOUNT: 20, // $20 USD
};

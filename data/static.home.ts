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
        route: '/(tabs)/wallet',
        color: '#F38218', // accent
    },
    {
        id: '2',
        icon: 'trophy',
        label: 'See Our Winners',
        route: '/(tabs)/draws',
        color: '#F8B735', // warning/yellow
    },
    {
        id: '3',
        icon: 'people',
        label: 'Invite Your Circle',
        action: 'share',
        color: '#1A760D', // success/green
    },
    {
        id: '4',
        icon: 'card',
        label: 'Payment Methods',
        route: '/(tabs)/wallet',
        color: '#040F40', // info/blue
    },
    {
        id: '5',
        icon: 'stats-chart',
        label: 'Your Impact',
        route: '/(tabs)/profile',
        color: '#571217', // primary
    },
    {
        id: '6',
        icon: 'gift',
        label: 'Share Your Code',
        action: 'referral',
        color: '#F38218', // accent
    },
    {
        id: '7',
        icon: 'help-circle',
        label: 'How We Work',
        action: 'how_it_works',
        color: '#666666', // textSecondary
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

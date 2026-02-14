import React from 'react';
import { ScrollView } from 'react-native';

import { Screen, Nav } from '@/components';
import { AppInput } from '@/components/form';
import { mockCurrentUser } from '@/data/userData.dummy';

export default function AccountSettingsScreen() {

    return (
        <Screen>
            <Nav title="Account Details" />
            <ScrollView className="px-4 pt-4">
                <AppInput
                    name="firstName"
                    label="First Name"
                    value={mockCurrentUser.first_name}
                    placeholder="First Name"
                    editable={false}
                    onChange={() => { }}
                />
                <AppInput
                    name="lastName"
                    label="Last Name"
                    value={mockCurrentUser.last_name}
                    placeholder="Last Name"
                    editable={false}
                    onChange={() => { }}
                />
                <AppInput
                    name="email"
                    label="Email Address"
                    value={mockCurrentUser.email}
                    placeholder="Email"
                    editable={false}
                    onChange={() => { }}
                />
                <AppInput
                    name="phone"
                    label="Phone Number"
                    value={mockCurrentUser.phone}
                    placeholder="Phone"
                    editable={false}
                    onChange={() => { }}
                />
            </ScrollView>
        </Screen>
    );
}

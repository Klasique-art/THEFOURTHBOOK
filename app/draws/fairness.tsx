import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';

import { Nav, Screen } from '@/components';
import AppText from '@/components/ui/AppText';
import { useColors } from '@/config';
import { mockDistributionCycles } from '@/data/dummy.draws';
import { mockFairnessProofs } from '@/data/fairness.dummy';
import { fairnessService } from '@/lib/services/fairnessService';
import { FairnessAuditReport, FairnessProofInput } from '@/types/fairness.types';

const shortenHash = (value: string) => `${value.slice(0, 12)}...${value.slice(-12)}`;

const FairnessScreen = () => {
    const colors = useColors();
    const [selectedCycleId, setSelectedCycleId] = React.useState(mockDistributionCycles[0]?.cycle_id ?? '');
    const [report, setReport] = React.useState<FairnessAuditReport | null>(null);
    const [proof, setProof] = React.useState<FairnessProofInput | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        let isMounted = true;

        const loadAudit = async () => {
            if (!selectedCycleId) return;

            setIsLoading(true);
            setError(null);

            try {
                const response = await fairnessService.getFairnessAudit(selectedCycleId);
                if (!isMounted) return;
                setProof(response.proof);
                setReport(response.report);
            } catch (err) {
                if (!isMounted) return;
                setError(err instanceof Error ? err.message : 'Could not load fairness audit.');
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        void loadAudit();

        return () => {
            isMounted = false;
        };
    }, [selectedCycleId]);

    const allChecksPassed = report?.checks.every((check) => check.passed) ?? false;

    return (
        <Screen>
            <Nav title="Verify Fairness" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
                <View
                    className="mb-4 rounded-2xl border p-4"
                    style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                >
                    <AppText className="text-sm leading-6" style={{ color: colors.textSecondary }}>
                        Re-run the same proof inputs used at draw time and validate each integrity checkpoint.
                    </AppText>
                    <View className="mt-3 flex-row flex-wrap">
                        {mockDistributionCycles
                            .filter((cycle) => mockFairnessProofs.some((proofItem) => proofItem.cycle_id === cycle.cycle_id))
                            .map((cycle) => {
                                const selected = cycle.cycle_id === selectedCycleId;
                                return (
                                    <Pressable
                                        key={cycle.cycle_id}
                                        onPress={() => setSelectedCycleId(cycle.cycle_id)}
                                        className="mb-2 mr-2 rounded-full border px-3 py-2"
                                        style={{
                                            borderColor: selected ? colors.accent : colors.border,
                                            backgroundColor: selected ? `${colors.accent}15` : colors.background,
                                        }}
                                    >
                                        <AppText className="text-xs font-semibold" style={{ color: selected ? colors.accent : colors.textPrimary }}>
                                            {cycle.period}
                                        </AppText>
                                    </Pressable>
                                );
                            })}
                    </View>
                </View>

                {isLoading ? (
                    <View className="mt-4 items-center">
                        <ActivityIndicator color={colors.accent} />
                        <AppText className="mt-2 text-sm" style={{ color: colors.textSecondary }}>
                            Running fairness audit...
                        </AppText>
                    </View>
                ) : (
                    <View>
                        {error && (
                            <View
                                className="mb-3 rounded-2xl border p-3"
                                style={{ borderColor: `${colors.error}40`, backgroundColor: `${colors.error}10` }}
                            >
                                <AppText className="text-sm" style={{ color: colors.error }}>
                                    {error}
                                </AppText>
                            </View>
                        )}

                        {report && (
                            <>
                                <View
                                    className="mb-3 rounded-2xl border p-4"
                                    style={{
                                        borderColor: allChecksPassed ? `${colors.success}40` : `${colors.warning}40`,
                                        backgroundColor: allChecksPassed ? `${colors.success}12` : `${colors.warning}12`,
                                    }}
                                >
                                    <View className="flex-row items-center">
                                        <Ionicons
                                            name={allChecksPassed ? 'checkmark-circle' : 'alert-circle'}
                                            size={22}
                                            color={allChecksPassed ? colors.success : colors.warning}
                                        />
                                        <AppText
                                            className="ml-2 text-base font-bold"
                                            style={{ color: allChecksPassed ? colors.success : colors.warning }}
                                        >
                                            {allChecksPassed ? 'Audit Passed' : 'Audit Requires Review'}
                                        </AppText>
                                    </View>
                                    <AppText className="mt-2 text-sm" style={{ color: colors.textSecondary }}>
                                        {report.period} integrity checks: {report.checks.filter((check) => check.passed).length}/
                                        {report.checks.length} passed.
                                    </AppText>
                                </View>

                                <View
                                    className="mb-3 rounded-2xl border p-4"
                                    style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                                >
                                    <AppText className="mb-2 text-sm font-semibold" style={{ color: colors.textPrimary }}>
                                        Proof Inputs
                                    </AppText>
                                    <AppText className="text-xs" style={{ color: colors.textSecondary }}>
                                        Algorithm: {proof?.algorithm_version}
                                    </AppText>
                                    <AppText className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
                                        Commitment Time: {proof?.committed_at}
                                    </AppText>
                                    <AppText className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
                                        Public Seed Source: {proof?.public_seed_source}
                                    </AppText>
                                    <AppText className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
                                        Server Seed Hash: {proof ? shortenHash(proof.server_seed_hash) : '-'}
                                    </AppText>
                                    <AppText className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
                                        Server Seed Reveal: {proof ? shortenHash(proof.server_seed_reveal) : '-'}
                                    </AppText>
                                </View>

                                <View
                                    className="mb-3 rounded-2xl border p-4"
                                    style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                                >
                                    <AppText className="mb-2 text-sm font-semibold" style={{ color: colors.textPrimary }}>
                                        Integrity Checks
                                    </AppText>
                                    {report.checks.map((check) => (
                                        <View key={check.id} className="mb-3 flex-row items-start">
                                            <Ionicons
                                                name={check.passed ? 'checkmark-circle' : 'close-circle'}
                                                size={18}
                                                color={check.passed ? colors.success : colors.error}
                                                style={{ marginTop: 1 }}
                                            />
                                            <View className="ml-2 flex-1">
                                                <AppText className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                                                    {check.label}
                                                </AppText>
                                                <AppText className="text-xs" style={{ color: colors.textSecondary }}>
                                                    {check.detail}
                                                </AppText>
                                            </View>
                                        </View>
                                    ))}
                                </View>

                                <View
                                    className="rounded-2xl border p-4"
                                    style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                                >
                                    <AppText className="mb-2 text-sm font-semibold" style={{ color: colors.textPrimary }}>
                                        Draw Fingerprint
                                    </AppText>
                                    <AppText className="text-xs" style={{ color: colors.textSecondary }}>
                                        Published: {shortenHash(report.expected_draw_fingerprint)}
                                    </AppText>
                                    <AppText className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
                                        Recomputed: {shortenHash(report.computed_draw_fingerprint)}
                                    </AppText>
                                </View>
                            </>
                        )}
                    </View>
                )}
            </ScrollView>
        </Screen>
    );
};

export default FairnessScreen;

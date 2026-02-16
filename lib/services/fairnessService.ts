import * as Crypto from 'expo-crypto';

import { mockDistributionCycles } from '@/data/dummy.draws';
import { mockFairnessProofs } from '@/data/fairness.dummy';
import { FairnessAuditReport, FairnessCheck, FairnessProofInput } from '@/types/fairness.types';

const sha256 = (value: string) =>
    Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, value);

const buildWinnersDigestInput = (cycleId: string, proof: FairnessProofInput) => {
    const cycle = mockDistributionCycles.find((item) => item.cycle_id === cycleId);

    if (!cycle) {
        throw new Error('Distribution cycle not found for fairness audit.');
    }

    const winners = [...(cycle.beneficiaries ?? [])]
        .sort((a, b) => a.winner_id.localeCompare(b.winner_id))
        .map((winner) => `${winner.winner_id}:${winner.prize_amount}:${winner.payout_status}`)
        .join('|');

    return `${cycle.cycle_id}|${proof.public_seed_value}|${proof.server_seed_hash}|${winners}`;
};

export const fairnessService = {
    async getFairnessAudit(cycleId: string): Promise<{ report: FairnessAuditReport; proof: FairnessProofInput }> {
        const cycle = mockDistributionCycles.find((item) => item.cycle_id === cycleId);
        if (!cycle) throw new Error('Distribution cycle not found.');

        const proof = mockFairnessProofs.find((item) => item.cycle_id === cycleId);
        if (!proof) throw new Error('Fairness proof not found for this cycle.');

        const revealedSeedHash = await sha256(proof.server_seed_reveal);
        const fairnessInput = buildWinnersDigestInput(cycleId, proof);
        const computedFingerprint = await sha256(fairnessInput);

        const winners = cycle.beneficiaries ?? [];
        const totalPayout = winners.reduce((sum, winner) => sum + winner.prize_amount, 0);
        const allWinnerCycleLinksValid = winners.every((winner) => winner.cycle_id === cycle.cycle_id);
        const allWinnersTimestamped = winners.every((winner) => Boolean(winner.selected_at));

        const checks: FairnessCheck[] = [
            {
                id: 'commit-reveal',
                label: 'Commit-Reveal Integrity',
                passed: revealedSeedHash === proof.server_seed_hash,
                detail: 'The revealed server seed hashes to the committed seed hash.',
            },
            {
                id: 'beneficiary-count',
                label: 'Beneficiary Count Integrity',
                passed: winners.length === cycle.beneficiaries_count,
                detail: `Expected ${cycle.beneficiaries_count} beneficiaries and found ${winners.length}.`,
            },
            {
                id: 'payout-total',
                label: 'Total Payout Integrity',
                passed: totalPayout === cycle.total_pool,
                detail: `Total payout ${totalPayout.toLocaleString()} matches pool ${cycle.total_pool.toLocaleString()}.`,
            },
            {
                id: 'cycle-link',
                label: 'Winner-Cycle Link Integrity',
                passed: allWinnerCycleLinksValid,
                detail: 'Each winner record is tied to the audited cycle.',
            },
            {
                id: 'winner-timestamps',
                label: 'Winner Timestamp Integrity',
                passed: allWinnersTimestamped,
                detail: 'Each beneficiary has a winner selection timestamp.',
            },
            {
                id: 'fingerprint',
                label: 'Published Fingerprint Integrity',
                passed: computedFingerprint === proof.published_draw_fingerprint,
                detail: 'Recomputed draw fingerprint equals published fingerprint.',
            },
        ];

        return {
            proof,
            report: {
                cycle_id: cycle.cycle_id,
                period: cycle.period,
                checks,
                computed_draw_fingerprint: computedFingerprint,
                expected_draw_fingerprint: proof.published_draw_fingerprint,
            },
        };
    },
};


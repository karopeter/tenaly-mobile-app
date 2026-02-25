import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/app/constants/theme';
import { TierVerification } from '@/app/types/tier.types';
import GradientButton from '../GradientButton/GradientButton';
import StatusBadge from '@/app/reusables/StatusBadge';

interface Tier2ContentProps {
  tier1: TierVerification | null;
  tier2: TierVerification | null;
}

const Tier2Content: React.FC<Tier2ContentProps> = ({ tier1, tier2 }) => {
  const router = useRouter();

  const canUpgrade = tier1?.status === 'approved' && !tier2;
  const isPending = tier2?.status === 'pending';
  const isApproved = tier2?.status === 'approved';

  const handleUpgrade = () => {
   router.push('/protected/tier-verification/upgrade-tier2' as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tier 2 — Address Verification</Text>
        {tier2 && <StatusBadge status={tier2.status} />}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Benefits</Text>
        <View style={styles.benefitItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.benefitText}>Higher trust that yields higher conversion rate</Text>
        </View>
        <View style={styles.benefitItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.benefitText}>Better visibility in search</Text>
        </View>
        <View style={styles.benefitItem}>
           <Text style={styles.bullet}>•</Text>
           <Text style={styles.benefitText}>Eligible for escrow transactions</Text>
        </View>
        <View style={styles.benefitItem}> 
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.benefitText}>Lower dispute penalty weighting</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Requirement</Text>
        <View style={styles.requirementItem}>
          <Text style={styles.requirementNumber}>1.</Text>
          <Text style={styles.requirementText}>Utility bill submission</Text>
        </View>
        <View style={styles.requirementItem}>
          <Text style={styles.requirementNumber}>2.</Text>
          <Text style={styles.requirementText}>Physical address confirmation</Text>
        </View>
      </View>

      {tier2?.status === 'rejected' && tier2.rejectionReason && (
        <View style={styles.rejectionBox}>
          <Text style={styles.rejectionTitle}>Documents submitted were rejected</Text>
          <Text style={styles.rejectionLabel}>Reason for rejection</Text>
          <Text style={styles.rejectionReason}>{tier2.rejectionReason}</Text>
        </View>
      )}

      {!isApproved && (
       <GradientButton 
         title="Upgrade to Tier 2"
         onPress={handleUpgrade}
         disabled={!canUpgrade || isPending}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.lightSpot,
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkGray,
    fontFamily: 'WorkSans_600SemiBold',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.darkGray,
    fontFamily: 'WorkSans_500Medium',
    marginBottom: 10,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  bullet: {
    fontSize: 14,
    color: colors.viewGray,
    marginRight: 8,
    fontFamily: 'WorkSans_400Regular',
  },
  benefitText: {
    fontSize: 14,
    color: colors.viewGray,
    fontFamily: 'WorkSans_500Medium',
    flex: 1,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementNumber: {
    fontSize: 14,
    color: colors.viewGray,
    marginRight: 5,
    fontFamily: 'WorkSans_400Regular',
  },
  requirementText: {
    fontSize: 14,
    color: colors.viewGray,
    fontFamily: 'WorkSans_500Medium',
    flex: 1,
  },
  rejectionBox: {
    backgroundColor: '#FEF2F2',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  rejectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#991B1B',
    fontFamily: 'WorkSans_600SemiBold',
    marginBottom: 10,
  },
  rejectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7C2D12',
    fontFamily: 'WorkSans_600SemiBold',
    marginBottom: 5,
  },
  rejectionReason: {
    fontSize: 13,
    color: '#7C2D12',
    fontFamily: 'WorkSans_400Regular',
    lineHeight: 20,
  },
});

export default Tier2Content;
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import GradientButton from '../GradientButton/GradientButton';
import { colors } from '@/app/constants/theme';
import { TierVerification, Business } from '@/app/types/tier.types';
import StatusBadge from '@/app/reusables/StatusBadge';
import BusinessListItem from '@/app/reusables/BusinessListItem';

interface Tier3ContentProps {
  tier2: TierVerification | null;
  tier3: TierVerification | null;
  businesses: Business[];
  currentLevel: number;
}

const Tier3Content: React.FC<Tier3ContentProps> = ({ 
  tier2, 
  tier3, 
  businesses,
  currentLevel 
}) => {
  const router = useRouter();

  const canUpgrade = tier2?.status === 'approved';
  const isPending = tier3?.status === 'pending';

  const handleUpgrade = () => {
    if (!canUpgrade || isPending) return;
    router.push('/protected/tier-verification/upgrade-tier3' as any);
  };

  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Tier 3 — Business Verification</Text>
          {tier3 && <StatusBadge status={tier3.status} />}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Benefits</Text>
          <View style={styles.benefitItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.benefitText}>Higher search priority</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.benefitText}>Access to paid ads tools</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.bullet}>•</Text>
             <Text style={styles.benefitText}>Eligible for bulk products uploads</Text>
          </View>
          <View style={styles.benefitItem}>
             <Text style={styles.bullet}>•</Text>
             <Text style={styles.benefitText}>Lower escrow fee (incentive)</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.benefitText}>Access to Tenaly logistics partners</Text>
          </View>
          <View style={styles.benefitItem}>
             <Text style={styles.bullet}>•</Text>
             <Text style={styles.benefitText}>Featured listing eligibility</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.benefitText}>Dedicated seller storefront page</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.benefitText}>Advanced analytics dashboard</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Requirement</Text>
          <View style={styles.requirementItem}>
            <Text style={styles.requirementNumber}>1.</Text>
            <Text style={styles.requirementText}>
              Corporate Affairs Commission (CAC) documents
            </Text>
          </View>
          <View style={styles.requirementItem}>
            <Text style={styles.requirementNumber}>2.</Text>
            <Text style={styles.requirementText}>
              Tax Identification Number (TIN)
            </Text>
          </View>
          <View style={styles.requirementItem}>
            <Text style={styles.requirementNumber}>3.</Text>
            <Text style={styles.requirementText}>
              Business licence or supporting documents
            </Text>
          </View>
        </View>

        {businesses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Businesses</Text>
            {businesses.map((business) => (
              <BusinessListItem
                key={business._id}
                business={business}
                tierVerification={tier3}
              />
            ))}
          </View>
        )}

        {tier3?.status !== 'approved' && (
          <GradientButton 
            title="Upgrade to Tier 3"
            onPress={handleUpgrade}
            disabled={!canUpgrade || isPending || businesses.length === 0}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
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
    flex: 1,
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
});

export default Tier3Content;
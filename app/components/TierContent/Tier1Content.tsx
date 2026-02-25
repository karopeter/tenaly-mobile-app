import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { colors } from '@/app/constants/theme';
import { TierVerification } from '@/app/types/tier.types';
import GradientButton from '../GradientButton/GradientButton';
import StatusBadge from '@/app/reusables/StatusBadge';

interface Tier1ContentProps {
  tier1: TierVerification | null;
}

const Tier1Content: React.FC<Tier1ContentProps> = ({ tier1 }) => {
  const router = useRouter();

  const requirements = [
    { text: 'Email and phone confirmation', completed: !!tier1?.email && !!tier1?.phone },
    { text: 'Government-issued ID', completed: !!tier1?.idDocument },
  ];

  const handleUpgrade = () => {
     router.push('/protected/tier-verification/upgrade-tier1' as any);
   };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tier 1 — Basic KYC</Text>
        {tier1 && <StatusBadge status={tier1.status} />}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Benefits</Text>
        <View style={styles.benefitItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.benefitText}>Can start selling immediately</Text>
        </View>
        <View style={styles.benefitItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.benefitText}>Access to marketplace visibility</Text>
        </View>
        <View style={styles.benefitItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.benefitText}>Builds initial trust vs unverified sellers</Text>
        </View>
        <View style={styles.benefitItem}>  
          <Text style={styles.bullet}>•</Text> 
          <Text style={styles.benefitText}>Eligible for standard messaging</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Requirement</Text>
        {requirements.map((req, index) => (
          <View key={index} style={styles.requirementItem}>
            <Text style={styles.requirementNumber}>{index + 1}.</Text>
            <Text style={styles.requirementText}>{req.text}</Text>
            {req.completed && tier1?.status === 'approved' && (
              <AntDesign name="check-circle" size={16} color="#059669" />
            )}
          </View>
        ))}
      </View>

      {tier1?.status !== "approved" && (
        <GradientButton
        title="Upgrade to Tier 1"
        onPress={handleUpgrade}
        disabled={tier1?.status === 'pending'}
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
});

export default Tier1Content;
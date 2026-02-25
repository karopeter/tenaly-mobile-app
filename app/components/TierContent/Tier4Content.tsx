import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '@/app/constants/theme';

interface Tier4ContentProps {
  currentLevel: number;
}

const Tier4Content: React.FC<Tier4ContentProps> = ({ currentLevel }) => {
  const isUnlocked = currentLevel >= 3;

  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Tier 4 — Elite Seller Tier</Text>
          <View style={[styles.badge, isUnlocked ? styles.unlockedBadge : styles.lockedBadge]}>
            <MaterialCommunityIcons 
              name={isUnlocked ? "lock-open" : "lock"} 
              size={14} 
              color="#FFF" 
            />
            <Text style={styles.badgeText}>
              {isUnlocked ? 'Unlocked' : 'Locked'}
            </Text>
          </View>
        </View>

        <Text style={styles.subtitle}>
          Awarded to top-performing{'\n'} sellers on Tenaly
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Benefits</Text>
          <View style={styles.benefitItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.benefitText}>Top placement in search result</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.benefitText}>Higher conversion rate</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.benefitText}>Access to promotional campaigns</Text>
          </View>
          <View style={styles.benefitItem}>
             <Text style={styles.bullet}>•</Text>
             <Text style={styles.benefitText}>Reduced transaction fees</Text>
          </View>
          <View style={styles.benefitItem}>
             <Text style={styles.bullet}>•</Text>
             <Text style={styles.benefitText}>Faster payouts</Text>
          </View>
          <View style={styles.benefitItem}>
             <Text style={styles.bullet}>•</Text>
             <Text style={styles.benefitText}>Eligible for Tenaly-backend return guratee</Text>
          </View>
        </View>

        <View style={styles.eliteItem}>
          <Text style={styles.eliteText}>How to unlock Elite Seller status</Text>
        </View>

        <View style={styles.infoBox}>
          <Image 
            source={require('../../../assets/images/elit-icon.png')}
            style={{ width: 13.33, height: 13.33 }}
            accessibilityLabel="Elite icon"
          />
          <Text style={styles.infoText}>
            Elite Seller status is automatically awarded{'\n'}based on performance.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.criteriaItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.criteriaText}>High rating (e.g 4.7+)</Text>
          </View>
          <View style={styles.criteriaItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.criteriaText}>Low dispute rate</Text>
          </View>
          <View style={styles.criteriaItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.criteriaText}>Fast response time</Text>
          </View>
          <View style={styles.criteriaItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.criteriaText}>Sales volume threshold</Text>
          </View>
          <View style={styles.criteriaItem}>
             <Text style={styles.bullet}>•</Text>
             <Text style={styles.criteriaText}>Compliance consistency</Text>
          </View>
        </View>
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
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkGray,
    fontFamily: 'WorkSans_600SemiBold',
    flex: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 5,
  },
  lockedBadge: {
    backgroundColor: '#CB0D0D',
  },
  unlockedBadge: {
    backgroundColor: '#238E15',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
    fontFamily: 'WorkSans_600SemiBold',
  },
  subtitle: {
    fontSize: 14,
    color: colors.blue,
    fontFamily: 'WorkSans_500Medium',
    marginBottom: 20,
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
  criteriaItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  bullet: {
    fontSize: 14,
    color: colors.lightGray,
    marginRight: 8,
    fontFamily: 'WorkSans_400Regular',
  },
  benefitText: {
    fontSize: 14,
    color: colors.viewGray,
    fontFamily: 'WorkSans_500Medium',
    flex: 1,
  },
  eliteItem: {
    marginBottom: 12,
  },
  eliteText: {
    color: colors.darkGray,
    fontWeight: '500',
    fontFamily: 'WorkSans_500Medium',
    fontSize: 16,
  },
  criteriaText: {
    fontSize: 14,
    color: colors.darkGray,
    fontFamily: 'WorkSans_500Medium',
    flex: 1,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#DFDFF9',
    padding: 15,
    borderRadius: 4,
    marginBottom: 20,
    gap: 10,
  },
  infoText: {
    fontSize: 12,
    color: '#5555DD',
    fontFamily: 'WorkSans_500Medium',
    flex: 1,
    lineHeight: 12,
  },
});

export default Tier4Content;
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { colors } from '../constants/theme';
import { Verification, Business } from '../types/verification.types';

interface VerificationListProps {
    personalVerification: Verification | null;
    businessVerifications: Verification[];
    userBusinesses: Business[];
    onSelectPersonal: () => void;
    onSelectBusiness: (businessId: string) => void;
}

const VerificationList: React.FC<VerificationListProps> = ({
    personalVerification,
    businessVerifications,
    userBusinesses,
    onSelectPersonal,
    onSelectBusiness,
}) => {
 const getStatusBadge = (status: string) => {
    const badges = {
      pending: { bg: '#CAA416', text: '#FAFAFA', label: 'Pending' },
      verified: { bg: '#16A34A', text: '#FFFFFF', label: 'Verified' },
      rejected: { bg: '#DC2626', text: '#FFFFFF', label: 'Rejected' },
    };
     return badges[status] || badges.pending;
  };


  // Get unverified businesses 
  const verifiedBusinessNames = businessVerifications.map((b) => b.businessName);
  const unverifiedBusinesses = userBusinesses.filter(
    (business) => !verifiedBusinessNames.includes(business.businessName)
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Become a verified seller</Text>

      {/* Personal Identity Verifications */}
      <TouchableOpacity
        style={[
            styles.card,
            personalVerification && styles.cardDisabled,
        ]}
        onPress={() => !personalVerification && onSelectPersonal()}
        disabled={!!personalVerification}>
         <View style={styles.cardContent}>
          <Text style={styles.cardText}>Verify your personal identity</Text>
          {personalVerification && (
            <View
              style={[
                 styles.badge,
                 {backgroundColor: getStatusBadge(personalVerification.status).bg },
              ]}
            >
             <Text
               style={[
                 styles.badgeText,
                 { color: getStatusBadge(personalVerification.status).text },
               ]}
             >
                {getStatusBadge(personalVerification.status).label}
             </Text>
            </View>
          )}
         </View>
         {!personalVerification && (
            <AntDesign name="right" size={20} color={colors.darkGray} />
         )}
      </TouchableOpacity>

      {/* Verified Businesses */}
      {businessVerifications.map((business, index) => (
        <View key={index} style={[styles.card, styles.cardContent]}>
          <Text style={styles.cardText}>{business.businessName}</Text>
          <View
            style={[
                styles.badge,
               { backgroundColor: getStatusBadge(business.status).bg },
            ]}
          >
           <Text
             style={[
                styles.badgeText,
                { color: getStatusBadge(business.status).text },
             ]}
           >
            {getStatusBadge(business.status).label}
           </Text>
          </View>
        </View>
      ))}

      {/* Unverified Businesses */}
      {unverifiedBusinesses.length > 0 && (
        <>
         <Text style={styles.sectionTitle}>Verify your businesses</Text>
         {unverifiedBusinesses.map((business) => (
            <TouchableOpacity
              key={business._id}
              style={styles.card}
              onPress={() => onSelectBusiness(business._id)}
            >
             <Text style={styles.cardText}>{business.businessName}</Text>
             <AntDesign name="right" size={20} color={colors.darkGray} />
            </TouchableOpacity>
         ))}
        </>
      )}

      {/* No Businesses message */}
      {userBusinesses.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            You haven't created any businesses yet.
          </Text>
          <Text style={styles.emptySubText}>
            Create a business first to verify it.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.darkGray,
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'WorkSans_600SemiBold',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.darkGray,
    marginTop: 20,
    marginBottom: 10,
    fontFamily: 'WorkSans_500Medium',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E8FF',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: colors.bg,
  },
  cardDisabled: {
    opacity: 1,
  },
  cardContent: {
    flex: 1,
  },
  cardText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.darkGray,
    fontFamily: 'WorkSans_500Medium',
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'WorkSans_500Medium',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#868686',
    textAlign: 'center',
    fontFamily: 'WorkSans_500Medium',
  },
  emptySubText: {
    fontSize: 14,
    color: '#868686',
    textAlign: 'center',
    marginTop: 4,
    fontFamily: 'WorkSans_400Regular',
  },
});


export default VerificationList;
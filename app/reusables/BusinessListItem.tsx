import React from "react";
import { 
 View,
 Text,
 StyleSheet
 } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { Business, TierVerification } from "../types/tier.types";
import { colors } from "../constants/theme";

interface BusinessListItemProps {
    business: Business;
    tierVerification: TierVerification | null;
}


const BusinessListItem: React.FC<BusinessListItemProps> = ({
    business,
    tierVerification
}) => {
  const getStatusIcon = () => {
   if (!tierVerification || tierVerification.businessId !== business._id) {
     return <AntDesign name="close-circle" size={16} color="#9CA3AF"  />;
   }

   switch (tierVerification.status) {
    case 'approved':
        return <AntDesign name="check-circle" size={16} color={colors.greenSuccess} />;
    case 'pending': 
      return <AntDesign name="exclamation-circle" size={16} color={colors.yellow600} />;;
    case 'rejected': 
       return <AntDesign name="close-circle" size={16} color={colors.red} />;
    default: 
      return <AntDesign name="close-circle" size={16} color="#9CA3AF" />
   }
  };

  const getStatusText = () => {
    if (!tierVerification || tierVerification.businessId !== business._id) {
        return 'Unverified';
    }

    switch (tierVerification.status) {
      case 'approved':
        return 'Verified';
      case 'pending':
        return 'Pending';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unverified';
    }
  };

  const getStatusColor = () => {
    if (!tierVerification ||  tierVerification.businessId !== business._id) {
        return '#767676';
    }

    switch (tierVerification.status) {
      case 'approved':
        return '#059669';
      case 'pending':
        return '#D97706';
      case 'rejected':
        return '#DC2626';
      default:
        return '#767676';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.businessName} numberOfLines={1}>
        {business.businessName}
      </Text>
      <View style={styles.statusContainer}>
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
        </Text>
        {getStatusIcon()}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  businessName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.darkGray,
    fontFamily: 'WorkSans_500Medium',
    flex: 1,
    marginRight: 10,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'WorkSans_500Medium',
    color: colors.viewGray,
  },
});

export default BusinessListItem;
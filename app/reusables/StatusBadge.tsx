import React from "react";
import {
 View,
 Text,
 StyleSheet
 } from "react-native";
import { TierStatus } from "../types/tier.types";
import { colors } from "../constants/theme";

 interface StatusBadgeProps {
   status: TierStatus;
 }


 const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const getStatusStyle = () => {
     switch (status) {
        case 'pending':
            return {
              container: styles.pendingContainer,
              text: styles.pendingText,
              label: 'Pending verification',
            };
        case 'approved': 
         return {
          container: styles.verifiedContainer,
          text: styles.verifiedText,
          label: 'Verified',
         };
       case 'rejected':
         return {
          container: styles.rejectedContainer,
          text: styles.rejectedText,
          label: 'Verification Failed',
         };
     }
    };


    const statusStyle = getStatusStyle();

    return (
      <View style={[styles.badge, statusStyle.container]}>
       <Text style={[styles.badgeText, statusStyle.text]}>
        {statusStyle.label}
       </Text>
      </View>
    );
 };




 const styles = StyleSheet.create({
   badge: {
    paddingVertical: 7,
    paddingHorizontal: 18,
    borderRadius: 4,
    alignSelf: 'flex-start'
   },
   badgeText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'WorkSans_600SemiBold',
   },
   pendingContainer: {
    backgroundColor: '#CAA416',
   },
   pendingText: {
    color: colors.bg,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'WorkSans_500Medium'
   },
   verifiedContainer: {
     backgroundColor: '#4FA544',
   },
   verifiedText: {
    color: colors.bg,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'WorkSans_500Medium'
   },
   rejectedContainer: {
    backgroundColor: '#CB0D0D',
   },
   rejectedText: {
    color: colors.bg,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'WorkSans_500Medium'
   },
 });

 export default StatusBadge;
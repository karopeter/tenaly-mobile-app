import React, { useState } from 'react';
import { 
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { colors } from '@/app/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

interface Plan {
  id: string;
  name: string;
  price: number;
}

interface BoostAdModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectPlan: (planId: string) => void;
  onPostFree: () => void;
}

const plans: Plan[] = [
    { id: 'basic', name: 'Basic', price: 15000 },
  { id: 'premium', name: 'Premium', price: 30000 },
  { id: 'vip', name: 'VIP', price: 45000 },
  { id: 'enterprise', name: 'Enterprise', price: 100000 },
];

export default function BoostAdModal({
  visible,
  onClose,
  onSelectPlan,
  onPostFree
}: BoostAdModalProps) {
   const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

   const handlePromote = () => {
     if (selectedPlan) {
      onSelectPlan(selectedPlan);
     }
   };

   return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
             <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <AntDesign name="close" size={24} color={colors.darkGray}  />
             </TouchableOpacity>
          </View>

          <Text style={styles.title}>Boost Your Ad for More Views</Text>
          <Text style={styles.subtitle}>
            Subscribe to a premium plan and get 5x or more visibility
          </Text>

          <TouchableOpacity style={styles.learnMoreButton}>
            <Text style={styles.learnMoreText}>
              View more about premium service →
            </Text>
          </TouchableOpacity>

          <ScrollView style={styles.plansList}>
             {plans.map((plan) => (
               <TouchableOpacity
                 key={plan.id}
                 style={[
                  styles.planItem,
                  selectedPlan === plan.id && styles.planItemSelected
                 ]}
                 onPress={() => setSelectedPlan(plan.id)}
               >
                <View style={styles.radioButton}>
                  {selectedPlan === plan.id && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <View style={styles.planIcon}>
                  <AntDesign name="star" size={16} color={colors.darkGray} />
                </View>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planPrice}>₦{plan.price.toLocaleString()}</Text>
               </TouchableOpacity>
             ))}
          </ScrollView>

          <TouchableOpacity style={styles.freeButton} onPress={onPostFree}>
             <Text style={styles.freeButtonText}>No, post for free</Text>
          </TouchableOpacity>

          <LinearGradient
            colors={['#00A8DF', '#1031AA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.promoteButtonGradient, !selectedPlan && styles.buttonDisabled]}
          >
            <TouchableOpacity
              style={styles.promoteButton}
              onPress={handlePromote}
              disabled={!selectedPlan}
            >
              <Text style={styles.promoteAdButtonText}>Yes, promote my ad</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </Modal>
   );
}


const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: colors.bg,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  header: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  closeButton: {
    padding: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkGray,
    textAlign: 'center',
    fontFamily: 'WorkSans_600SemiBold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#767676",
    textAlign: 'center',
    fontWeight: '400',
    fontFamily: 'WorkSans_400Regular',
    marginBottom: 12,
  },
  learnMoreButton: {
    alignSelf: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DFDFF9',
    marginVertical: 16,
    marginHorizontal: 20,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  learnMoreText: {
    fontSize: 12,
    color: colors.blue,
    fontWeight: '500',
    fontFamily: 'WorkSans_500Medium'
  },
  plansList: {
    marginBottom: 20,
  },
  planItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginBottom: 10,
  },
  planItemSelected: {
    borderColor: colors.blue,
    backgroundColor: '#F0F9FF',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.blue,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.blue,
  },
  planIcon: {
    marginRight: 8,
  },
  planName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    color: colors.darkGray,
    fontFamily: 'WorkSans_400Regular'
  },
  planPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.darkGray,
    fontFamily: 'WorkSans_500Medium'
  },
  freeButton: {
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  freeButtonText: {
    fontSize: 16,
    color: colors.darkGray,
    fontWeight: '600',
    fontFamily: 'WorkSans_600SemiBold'
  },
  promoteButtonGradient: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  promoteButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  promoteAdButtonText: {
    color: colors.bg,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'WorkSans_600SemiBold'
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
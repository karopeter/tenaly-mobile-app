import React from 'react';
import {  
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../constants/theme';

interface BusinessOnboardingModalProps {
    visible: boolean;
    onSkip: () => void;
    onContinue: () => void;
}

const BusinessOnboardingModal: React.FC<BusinessOnboardingModalProps> = ({
 visible,
 onSkip, 
 onContinue,
}) => {
   return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onSkip}
    >
     <View style={styles.modalOverlay}>
       <View style={styles.modalContent}>
         <Text style={styles.modalTitle}>Register your business</Text>
         <Text style={styles.modalSubtitle}>
          Complete your business registration to start posting ads and reach 
          potential customers 
         </Text>

         <View style={styles.modalButtons}>
           <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
             <Text style={styles.skipText}>Skip for now</Text>
           </TouchableOpacity>

           <TouchableOpacity
             style={styles.continueButtonWrapper}
             onPress={onContinue}
           >
           <LinearGradient
             colors={['#00A8DF', '#1031AA']}
             start={{ x: 0, y: 0 }}
             end={{ x: 1, y: 0 }}
             style={styles.continueButton}
           >
            <Text style={styles.continueText}>Continue to Registration</Text>
           </LinearGradient>
           </TouchableOpacity>
         </View>
       </View>
     </View>
    </Modal>
   )
}


const styles = StyleSheet.create({
 modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 24,
    //justifyContent: 'flex-end',
  },
  modalContent: {
   backgroundColor: colors.bg,
   borderRadius: 24,
   padding: 24,
   paddingBottom: 40,
  },
//   modalContent: {
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     padding: 24,
//     paddingBottom: 40,
//   },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.darkGray,
    fontFamily: 'WorkSans_600SemiBold',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.lightGrey,
    fontFamily: 'WorkSans_400Regular',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  modalButtons: {
    gap: 12,
  },
  skipButton: {
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  skipText: {
    fontSize: 16,
    color: colors.darkGray,
    fontFamily: 'WorkSans_500Medium',
    fontWeight: '500',
  },
  continueButtonWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  continueButton: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 8,
  },
  continueText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'WorkSans_500Medium',
    fontWeight: '600',
  },
})

export default BusinessOnboardingModal;
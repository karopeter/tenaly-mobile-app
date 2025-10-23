import React  from 'react';
import {  
 View,
 Text,
 Modal,
 TouchableOpacity,
 StyleSheet
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { colors } from '@/app/constants/theme';

interface PaymentMethodModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectWallet: () => void;
    onSelectPaystack: () => void;
    walletBalance: number;
    requiredAmount: number;
}

export default function PaymentMethodModal({
  visible,
  onClose,
  onSelectWallet,
  onSelectPaystack,
  walletBalance,
  requiredAmount
}: PaymentMethodModalProps) {
  const hasEnoughBalance = walletBalance >= requiredAmount;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
       <View style={styles.modalContainer}>
         <View style={styles.header}>
           <Text style={styles.title}>Choose Payment Method</Text>
           <TouchableOpacity onPress={onClose}>
             <AntDesign name="close" size={24} color={colors.darkGray} />
           </TouchableOpacity>
         </View>

          <Text style={styles.amount}>Amount: ₦{requiredAmount.toLocaleString()}</Text>

          <TouchableOpacity
            style={[styles.methodButton, !hasEnoughBalance && styles.methodButtonDisabled]}
            onPress={onSelectWallet}
            disabled={!hasEnoughBalance}
          >
            <AntDesign name="wallet" size={24} color={hasEnoughBalance ? colors.blue : colors.lightGray} />
            <View style={styles.methodInfo}>
              <Text style={[styles.methodTitle, !hasEnoughBalance && styles.textDisabled]}>
                Wallet Balance
              </Text>
              <Text style={[styles.methodSubtitle, !hasEnoughBalance && styles.textDisabled]}>
                 Available: ₦{walletBalance.toLocaleString()}
              </Text>
              {!hasEnoughBalance && (
                <Text style={styles.insufficientText}>Insufficient balance</Text>
              )}
            </View>
            <AntDesign name='right' size={20} color={colors.lightGray} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.methodButton} onPress={onSelectPaystack}>
            <AntDesign name="credit-card" size={24} color={colors.blue} />
            <View style={styles.methodInfo}>
              <Text style={styles.methodTitle}>Pay with Paystack</Text>
              <Text style={styles.methodSubtitle}>Card, Bank Transfer, USSD</Text>
            </View>
            <AntDesign name='right' size={20} color={colors.lightGray} />
          </TouchableOpacity>
       </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.darkGray,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkGray,
    marginBottom: 20,
    textAlign: 'center',
  },
  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    marginBottom: 12,
  },
  methodButtonDisabled: {
    opacity: 0.5,
  },
  methodInfo: {
    flex: 1,
    marginLeft: 12,
  },
  methodTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.darkGray,
    marginBottom: 4,
  },
  methodSubtitle: {
    fontSize: 13,
    color: colors.lightGray,
  },
  textDisabled: {
    color: colors.lightGray,
  },
  insufficientText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 4,
  },
});
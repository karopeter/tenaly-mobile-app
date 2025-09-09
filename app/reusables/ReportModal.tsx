import React, { useState } from 'react';
import { 
 Modal,
 View, 
 Text,
 TouchableOpacity,
 TextInput,
 StyleSheet,
 ActivityIndicator
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../constants/theme';
import apiClient from '../utils/apiClient';
import { showErrorToast, showSuccessToast } from '../utils/toast';

interface ReportModalProps {
    visible: boolean;
    onClose: () => void;
    productId: string;
   onSuccess?: () => void;
}

const reportReasons = [
    'Fraud or Scam Attempt',
  'Inaccurate or Misleading Information',
  'Spam or Duplicate Listing',
  'Stolen or Unverified Property',
  'Fake Images or Stock Photos',
  'Harassment or Unsafe Interaction',
  'Others',
];


export default function ReportModal({ visible, onClose, productId, onSuccess }: ReportModalProps) {
    const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const toggleReason = (reason: string) => {
        if (selectedReasons.includes(reason)) {
           setSelectedReasons(selectedReasons.filter(r => r !== reason));
        } else {
            setSelectedReasons([...selectedReasons, reason]);
        }
    };

    const handleSubmit =  async () => {
       if (!productId) {
        showErrorToast("Error. Missing product ID");
        return;
       }

       if (selectedReasons.length === 0) {
        showErrorToast("Error. Please select at least one reason");
        return;
       }

       try {
        if (!apiClient) {
         showErrorToast('API client not initialized.');
         return;
        }
        setLoading(true);

        const res = await apiClient.post('/api/report/submit-report', {
            productId,
            reason: selectedReasons.join(', '),
            additionalDetails: notes
        });

        if (res.data.success) {
            showSuccessToast("Report submitted successfully. Our representative will review and get back to you!");
            if (onSuccess) onSuccess();
            setSelectedReasons([]);
             setNotes('');
             onClose();
        } else {
          showErrorToast("Error submitting Report, Something went wrong.");
        }
       } catch (error: any) {
          console.error("Report submit error:", error);
          showErrorToast(error.response?.data?.message || 'Failed to submit report');
       } finally {
        setLoading(false);
       }
    };

    return (
       <Modal 
         animationType="slide" 
         transparent 
         visible={visible} 
         onRequestClose={onClose}>
         <View style={styles.modalOverlay}>
           <View style={styles.modalContainer}>
              {/* Header */}
              <View style={styles.modalHeader}>
                 <Text style={styles.modalTitle}>Report this listing</Text>
                 <TouchableOpacity onPress={onClose}>
                    <AntDesign name="close" size={20} color="#374151" />
                 </TouchableOpacity>
              </View>

              {/* Optiond */}
              {reportReasons.map((reason, index) => (
                <TouchableOpacity
                key={index}
                style={styles.checkboxRow}
                onPress={() => toggleReason(reason)}>
                  <View 
                   style={[
                    styles.checkbox,
                    selectedReasons.includes(reason) && styles.checkboxChecked,
                   ]}
                  />
                  <Text style={styles.checkboxLabel}>{reason}</Text>
                </TouchableOpacity>
              ))}

              {/* Notes Input */ }
              <TextInput
               style={styles.notesInput}
               placeholder="Additional Notes (Optional)"
               placeholderTextColor="#9CA3AF"
               value={notes}
               onChangeText={setNotes}
               multiline
              />

              {/* Submit */}
              <TouchableOpacity onPress={handleSubmit}>
            <LinearGradient
            colors={['#00A8DF', '#1031AA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              paddingVertical: 12,
              marginBottom: 8,
            }}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Submit</Text>
              )}
          </LinearGradient>
              </TouchableOpacity>
           </View>
         </View>
       </Modal>
    );
} 

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlayBackground,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContainer: {
    width: '90%',
    backgroundColor: colors.bg,
    borderRadius: 12,
    padding: 20
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkGray
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#1031AA',
    borderColor: '#1031AA',
  },
  checkboxLabel: {
    fontSize: 14,
    color:  '#374151',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    padding: 10,
    fontSize: 14,
    color: colors.darkGray,
    marginTop: 10,
    marginBottom: 20,
    minHeight: 60,
    textAlignVertical: 'top'
  },
  submitButtonText: {
    color: colors.bg,
    fontWeight: '600',
    fontSize: 16
  }
});
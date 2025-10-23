import React, { useState, useEffect } from 'react';
import {
  View, 
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import apiClient from '@/app/utils/apiClient';
import { colors } from '@/app/constants/theme';
import { showErrorToast } from '@/app/utils/toast';

interface Business {
    _id: string;
    businessName: string;
}


interface Props {
    visible: boolean;
    onClose: () => void;
    onSelect: (Business: Business) => void;
}

const BusinessModal: React.FC<Props> = ({ visible, onClose, onSelect }) => {
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible)   fetchBusinesses();
    }, [visible]);

    const fetchBusinesses = async () => {
      try {
        if (!apiClient) {
          showErrorToast("API client is not initialized");
          return;
        }
        setLoading(true);
        const response = await apiClient.get('/api/business/my-businesses');
        setBusinesses(response.data);
      } catch (error: any) {
         console.error('Error fetching businesses:', error);
      } finally {
        setLoading(false);
      }
   };

    return (
        <Modal visible={visible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <View style={{ width: 24 }} />
                <Text style={styles.modalTitle}>Select Business</Text>
                <TouchableOpacity onPress={onClose}>
                   <AntDesign name="close" size={24} color={colors.darkGray} />
                </TouchableOpacity>
              </View>
   
              {loading ? (
               <ActivityIndicator size="large" color={colors.blue} style={{ marginTop: 20 }} />
              ): (
               <ScrollView>
                  {businesses.map((business) => (
                    <TouchableOpacity
                      key={business._id}
                      style={styles.businessItem}
                      onPress={() => {
                       onSelect(business);
                       onClose();
                      }}
                    >
                     <Text style={styles.businessText}>{business.businessName}</Text>
                    </TouchableOpacity>
                  ))}
               </ScrollView>
              )}
            </View>
          </View>
        </Modal>
      );
}

const styles = StyleSheet.create({ 
     // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContainer: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '80%'
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'WorkSans_400Regular',
    color: colors.darkGray
  },
  businessItem: {
     paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  businessText: {
   fontSize: 16,
   fontWeight: '600',
   fontFamily: 'WorkSans_600SemiBold',
   color: colors.darkGray
  }
});

export default BusinessModal;
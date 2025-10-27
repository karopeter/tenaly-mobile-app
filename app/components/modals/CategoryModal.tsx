import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet
} from 'react-native';
import { AntDesign, Feather } from '@expo/vector-icons';
import { colors } from '@/app/constants/theme';


interface Props {
    visible: boolean;
    onClose: () => void;
    onSelect: (category: string) => void;
}


const CategoryModal: React.FC<Props> = ({ visible, onClose, onSelect }) => {
    const [selectedMain, setSelectedMain] = useState<string | null>(null);

    const vehicleCategories = ['car', 'bus', 'tricycle'];
    const propertyCategories = [
       'Commercial Property For Rent',
       'Commercial Property For Sale',
       'House and Apartment Property For Rent',
       'House and Apartment Property For Sale',
       'Land and Plot For Rent',
       'Lands and Plot For Sale',
       'Short Let Property',
       'Event Center And Venues'
  ];


   return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
                <View style={{ width: 24, }} />
               <Text style={styles.modalTitle}>Category</Text>

               <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <AntDesign name="close" size={24} color={colors.black}  />
               </TouchableOpacity>
            </View>
  
            {!selectedMain ? (
              <View>
                <TouchableOpacity
                  style={styles.categoryItem}
                  onPress={() => setSelectedMain('vehicle')}
                >
                  <Feather name="truck" size={20} color={colors.lightGrey} />
                  <Text style={styles.categoryText}>Vehicles</Text>
                  <AntDesign name="right" size={16} color={colors.darkGray} />
                </TouchableOpacity>
  
                <TouchableOpacity
                  style={styles.categoryItem}
                  onPress={() => setSelectedMain('property')}
                >
                  <Feather name="home" size={20} color={colors.lightGrey} />
                  <Text style={styles.categoryText}>Property</Text>
                  <AntDesign name="right" size={16} color={colors.darkGray} />
                </TouchableOpacity>
              </View>
            ): (
             <ScrollView>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setSelectedMain(null)}
              >
                <AntDesign name="left" size={16} color={colors.blue} />
              </TouchableOpacity>
  
              {(selectedMain === 'vehicle' ? vehicleCategories : propertyCategories).map((cat) => (
                <TouchableOpacity
                   key={cat}
                   style={styles.subcategoryItem}
                   onPress={() => {
                     onSelect(cat);
                     onClose();
                     setSelectedMain(null);
                   }}>
                  <Text style={styles.subcategoryText}>{cat}</Text>
                </TouchableOpacity>
              ))}
             </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    );
};


const styles = StyleSheet.create({
    modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContainer: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
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
    borderBottomColor: colors.border,
    position: 'relative'
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: colors.darkGray,
    fontFamily: 'Poppins_600SemiBold',
    flex: 1,
  },
  closeButton: {
    position: 'relative',
    right: 0,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  categoryText: {
    flex: 1,
    fontSize: 16,
    color: colors.black,
    marginLeft: 12
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12
  },
    subcategoryItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  subcategoryText: {
    fontSize: 15,
    color: colors.black
  },
});

export default CategoryModal;
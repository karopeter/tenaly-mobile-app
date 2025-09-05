import React, { useState } from 'react';
import { 
  View, 
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';

interface LocationSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelect: (state: string, lga: string) => void;
}

const NIGERIAN_STATES = [
  {
    name: 'Lagos',
    lgas: ['Ikeja', 'Surulere', 'Lagos Mainland', 'Lagos Island', 'Eti-Osa', 'Agege', 'Ifako-Ijaiye', 'Kosofe', 'Mushin', 'Ojo', 'Oshodi-Isolo', 'Shomolu', 'Apapa'],
  },
  {
    name: 'Abuja',
    lgas: ['Abuja Municipal', 'Bwari', 'Gwagwalada', 'Kuje', 'Kwali'],
  },
  {
    name: 'Rivers',
    lgas: ['Port Harcourt', 'Obio/Akpor', 'Okrika', 'Ogu/Bolo', 'Eleme', 'Tai', 'Gokana', 'Khana', 'Oyigbo', 'Opobo/Nkoro', 'Andoni', 'Bonny', 'Degema', 'Asari-Toru', 'Akuku-Toru'],
  },
  {
    name: 'Kano',
    lgas: ['Kano Municipal', 'Fagge', 'Dala', 'Gwale', 'Nassarawa', 'Kumbotso', 'Ungogo', 'Dawakin Tofa', 'Tofa', 'Rimin Gado', 'Gabasawa', 'Gezawa', 'Albasawa', 'Bagwai', 'Shanono', 'Karaye', 'Rogo', 'Takai', 'Warawa', 'Kabo', 'Kura', 'Madobi', 'Chikun', 'Bebeji', 'Kiru', 'Sumaila', 'Garko', 'Tudun Wada', 'Doguwa', 'Ajingi', 'Albasawa', 'Dambatta', 'Makoda', 'Kunchi', 'Bichi', 'Tsanyawa', 'Shaggar', 'Minjibir', 'Kura', 'Garun Mallam', 'Gaya', 'Bagwai', 'Wudil'],
  },
  // Add more states as needed
];

const LocationSelectorModal: React.FC<LocationSelectorModalProps> = ({
   visible,
   onClose,
   onLocationSelect,
}) => {
   const [selectedState, setSelectedState] = useState<string | null>(null);
   const [selectedLGA, setSelectedLGA] = useState<string | null>(null);

   const handleStateSelect = (stateName: string) => {
    setSelectedState(stateName);
    setSelectedLGA(null); // Reset LGA selection 
   };

   const handleLGASelect = (lgaName: string) => {
    if (selectedState) {
      onLocationSelect(selectedState, lgaName);
      onClose();
      // Reset selections after choosing 
      setSelectedState(null);
      setSelectedLGA(null);
    }
   };

   return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */ }
          <View style={styles.modalHeader}>
              <View style={styles.modalTitle}>
                {selectedState ? 'Select LGA' : 'Select State'}
              </View>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
          </View>

          {/* Content */ }
          <ScrollView contentContainerStyle={styles.modalContent}>
            {!selectedState ? (
              // Show states 
              NIGERIAN_STATES.map((state, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.optionItem}
                  onPress={() => handleStateSelect(state.name)}
                >
                  <Text style={styles.optionText}>{state.name}</Text>
                </TouchableOpacity>
              ))
            ): (
              // Show LGAs 
              NIGERIAN_STATES.find(s => s.name === selectedState)?.lgas.map((lga, index) => (
                <TouchableOpacity 
                  key={index}
                  style={styles.optionItem}
                  onPress={() => handleLGASelect(lga)}
                >
                  <Text style={styles.optionText}>{lga}</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
   );
}


const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1, 
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDED'
  },
   modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#525252',
  },
  closeButton: {
   fontSize: 18,
  color: '#888'
  },
  modalContent: {
    padding: 10,
  },
  optionItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDED'
  },
  optionText: {
    fontSize: 16,
    color: '#525252'
  }
});

export default LocationSelectorModal;
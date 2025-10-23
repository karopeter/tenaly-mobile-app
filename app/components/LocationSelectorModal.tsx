import React, { useState, useEffect } from 'react';
import { 
 View, 
 Text,
 Modal,
 TouchableOpacity,
 ScrollView,
 StyleSheet,
 ActivityIndicator
} from 'react-native';
import apiClient from '../utils/apiClient';
import { colors } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface LocationSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelect: (state: string, lga: string) => void;
}

interface LocationData {
  _id: string;
  state: string;
  lgas: string[];
  __v: number;
  ads?: string;
}


const LocationSelectorModal: React.FC<LocationSelectorModalProps> = ({
   visible,
   onClose,
   onLocationSelect,
}) => {
 const [selectedState, setSelectedState] = useState<string | null>(null);
 const [selectedLGA, setSelectedLGA] = useState<string | null>(null);
 const [locationData, setLocationData] = useState<LocationData[]>([]);
 const [loading, setLoading] = useState<boolean>(false);
 const [error, setError] = useState<string | null>(null);

 // Fetch LOCATION DATA  when modal, becomes visible 
 useEffect(() => {
   if (visible) {
     fetchLocationData();
   }
 }, [visible]);

 const fetchLocationData = async () => {
   if (!apiClient) {
    setError('API client is not inialized');
    return;
   }

   setLoading(true);
   setError(null);

    try {
     const response = await apiClient.get('/api/locations/getLocation');
     setLocationData(response.data);
    } catch (err) {
     console.error('Error fetching location data:', err);
     setError('Failed to load locations. Please try again.');
    } finally {
      setLoading(false);
    }
 };

 const handleStateSelect = (stateName: string) => {
   setSelectedState(stateName);
   setSelectedLGA(null);
 };

 const handleLGASelect = (lgaName: string) => {
   if (selectedState) {
    onLocationSelect(selectedState, lgaName);
    onClose();
    // Reset  selection after choosing 
    setSelectedState(null);
    setSelectedLGA(null);
   }
 };

 const handleClose = () => {
  onClose();
  // Reset selection when closing 
  setSelectedState(null);
  setSelectedLGA(null);
 };

 const getSelectedStateLGAs = () => {
  const state = locationData.find(s => s.state ===  selectedState);
  return state?.lgas || [];
 };

 return (
  <Modal
    visible={visible}
    animationType="slide"
    transparent={true}
    onRequestClose={handleClose}
  >
   <View style={styles.modalOverlay}>
     <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {selectedState ? 'Select LGA' : 'Select State'}
          </Text>
            <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={22} color={colors.closeDark} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView contentContainerStyle={styles.modalContent}>
          {loading ? (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color={colors.prikyBlue} />
              <Text style={styles.loadingText}>Loading locations...</Text>
            </View>
          ): error ? (
            <View style={styles.centerContent}>
               <Text style={styles.errorText}>{error}</Text>
               <TouchableOpacity
                style={styles.retryButton}
                onPress={fetchLocationData}
               >
                <Text style={styles.retryButtonText}>Retry</Text>
               </TouchableOpacity>
            </View>
          ): !selectedState ? (
            // Show states 
            locationData.map((location) => (
              <TouchableOpacity
                key={location._id}
                style={styles.optionItem}
                onPress={() => handleStateSelect(location.state)}
              >
                 <Text style={styles.optionText}>{location.state}</Text>
                 <Ionicons name="chevron-forward" size={18} color={colors.lightGrey} />
              </TouchableOpacity>
            ))
          ): (
            // Show LGA with back button 
            <>
             <TouchableOpacity
               style={styles.backButton}
               onPress={() => setSelectedState(null)}
             >
               <Ionicons name="chevron-back" size={16} color={colors.closeDark} />
              <Text style={styles.backButtonText}>Back to States</Text>
             </TouchableOpacity> 
             {getSelectedStateLGAs().map((lga, index) => (
               <TouchableOpacity
                 key={index}
                 style={styles.optionItem}
                 onPress={() =>  handleLGASelect(lga)}
               >
                <Text style={styles.optionText}>{lga}</Text>
               </TouchableOpacity>
             ))}
            </>
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
    backgroundColor: colors.bg,
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
    borderBottomColor: colors.lightSpot
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'WorkSans_600SemiBold',
    color: colors.darkGray,
  },
  closeButton: {
    fontSize: 24,
    color: colors.closeDark,
    fontWeight: '300',
  },
  modalContent: {
    padding: 10,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightSpot
  },
  optionText: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'WorkSans_400Regular',
    color: colors.darkGray
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#888',
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#00A86B',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  backButton: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDED',
    backgroundColor: '#F8F8F8',
  },
  backButtonText: {
    fontSize: 14,
    color: colors.darkGray,
    fontWeight: '600',
    fontFamily: 'WorkSans_600SemiBold'
  },
});


export default LocationSelectorModal;
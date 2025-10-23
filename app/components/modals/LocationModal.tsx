import React, { useEffect, useState } from 'react';
import {
  View, 
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { AntDesign, Feather } from '@expo/vector-icons';
import apiClient from '@/app/utils/apiClient';
import { colors } from '@/app/constants/theme';
import { showErrorToast } from '@/app/utils/toast';

interface Location {
    _id: string;
    state: string;
    lgas: string[];
}

interface LocationModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (value: string) => void;
}

const LocationModal: React.FC<LocationModalProps> = ({ visible, onClose, onSelect }) => {
    const [locations, setLocations] = useState<Location[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [expandedState, setExpandedState] = useState<string | null>(null);

    useEffect(() => {
      if (visible) fetchLocations();
    }, [visible, searchQuery]);

    const fetchLocations = async () => {
     try {
      if (!apiClient) {
        showErrorToast("API client is not initialized");
        return;
      }
      setLoading(true);
      const response = await apiClient.get(`/api/locations/getLocation?search=${searchQuery}`);
      setLocations(response.data);
     } catch (error: any) {
       console.error('Error fetching locations:', error);
     } finally {
      setLoading(false);
     }
  };

    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.header}>
                <View style={{ width: 24 }} />
              <Text style={styles.modalTitle}>Select Location</Text>
               <TouchableOpacity onPress={onClose}>
                 <AntDesign name="close" size={24} color={colors.darkGray} />
               </TouchableOpacity>
              </View>
  
          <View style={styles.searchContainer}>
            <Feather name="search" size={20} color={colors.darkGray} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for a location"
              placeholderTextColor={colors.darkGray}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
  
          {loading ? (
            <ActivityIndicator size="large" color={colors.blue} style={{ marginTop: 20 }} />
          ): (
            <ScrollView style={styles.locationList}>
              {locations.map((location) => (
                <View key={location._id} style={styles.stateBlock}>
                  <TouchableOpacity
                    style={styles.stateItem}
                    onPress={() => setExpandedState(
                      expandedState === location.state ? null : location.state
                    )}
                  >
                   <Text style={styles.stateText}>{location.state}</Text>
                   <AntDesign
                     name={expandedState === location.state ? 'up' : 'down'}
                     size={16}
                     color={colors.darkGray}
                   />
                  </TouchableOpacity>
  
                  {expandedState === location.state && (
                    <View style={styles.lgaContainer}>
                       {location.lgas.map((lga) => (
                        <TouchableOpacity
                          key={lga}
                          style={styles.lgaItem}
                          onPress={() => {
                            onSelect(`${location.state}, ${lga}`);
                            onClose();
                            setExpandedState(null);
                          }}
                        >
                         <Text style={styles.lgaText}>{lga}</Text>
                        </TouchableOpacity>
                       ))}
                    </View>
                  )}
                </View>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
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
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'WorkSans_600Medium',
    color: colors.darkGray
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 12
  },
   locationList: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.blueGrey,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginVertical: 8
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 14,
    color: colors.black
  },
  list: {
    marginTop: 8
  },
  stateBlock: {
    borderRadius: 8,
    backgroundColor: colors.bg,
    marginBottom: 6,
    overflow: 'hidden'
  },
  stateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  stateText: {
    fontSize: 14,
    color: colors.darkGray,
    fontWeight: '400',
    fontFamily: 'Poppins_400Regular'
  },
  lgaContainer: {
    paddingLeft: 20,
    backgroundColor: colors.bg
  },
  lgaItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  lgaText: {
    fontSize: 14,
    color: colors.darkGray,
    fontWeight: '400',
    fontFamily: 'Poppins_400Regular'
  }
});

export default LocationModal;
import React, { useState, useEffect } from 'react';
import {
 View,
 Text,
 TouchableOpacity,
 ScrollView, 
 ActivityIndicator,
 StyleSheet
} from 'react-native';
import { colors } from '../constants/theme';
import apiClient from '../utils/apiClient';


interface LocationData {
  _id: string;
  state: string;
  lgas: string[];
}

interface DropdownProps {
    label?: string;
   selectedValue: string;
   onSelect: (value: string) => void;
   type: 'state' | 'lga';
   selectedState?: string;
}


const LocationDropdown: React.FC<DropdownProps> = ({
  label,
  selectedValue, 
  onSelect,
  type,
  selectedState
}) => {
 const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


   // Fetch locations data
  const fetchLocations = async () => {
    if (!apiClient) {
      setError('API client not initialized');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get('/api/locations/getLocation');
      const locationData: LocationData[] = response.data;

      if (type === 'state') {
        // Extract all state names
        const states = locationData.map(item => item.state);
        setOptions(states);
      } else if (type === 'lga' && selectedState) {
        // Find the selected state and extract its LGAs
        const stateData = locationData.find(item => item.state === selectedState);
        if (stateData) {
          setOptions(stateData.lgas);
        } else {
          setOptions([]);
        }
      }
    } catch (err) {
      console.error('Error fetching locations:', err);
      setError('Failed to load locations');
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [type, selectedState]);

  
   const handleSelect = (value: string) => {
    onSelect(value);
    setOpen(false);
  };

   const getPlaceholderText = () => {
    if (type === 'state') {
      return 'Select a state';
    } else if (type === 'lga') {
      return selectedState ? 'Select an LGA' : 'Select a state first';
    }
    return 'Select an option';
  };

   const isDisabled = type === 'lga' && !selectedState;


   return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity 
        style={[styles.input, isDisabled && styles.disabledInput]} 
        onPress={() => !isDisabled && setOpen(!open)}
        disabled={isDisabled}
      >
        <Text style={selectedValue ? styles.valueText : styles.placeholder}>
          {selectedValue || getPlaceholderText()}
        </Text>
        
        {loading ? (
          <ActivityIndicator size="small" color="#555" />
        ) : (
          <Text style={styles.icon}>{open ? "▲" : "▼"}</Text>
        )}
      </TouchableOpacity>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchLocations} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {open && !loading && !error && (
        <View style={styles.dropdown}>
          <ScrollView
            style={{ maxHeight: 150 }}
            nestedScrollEnabled={true}
          >
            {options.length === 0 ? (
              <View style={styles.option}>
                <Text style={styles.noOptionsText}>No options available</Text>
              </View>
            ) : (
              options.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.option}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={styles.optionText}>{item}</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
    color: colors.darkGray,
    fontFamily: 'WorkSans_500Medium'
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: "space-between",
    alignItems: "center"
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    opacity: 0.7
  },
  valueText: {
    fontSize: 14,
    color: colors.darkGray
  },
  placeholder: {
    fontSize: 14,
    color: '#999'
  },
  icon: {
    fontSize: 14,
    color: "#555"
  },
  dropdown: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee"
  },
  optionText: {
    fontSize: 14,
    color: "#333"
  },
  noOptionsText: {
    fontSize: 14,
    color: "#999",
    fontStyle: 'italic'
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#FF4757',
    flex: 1,
    fontFamily: 'WorkSans_500Medium'
  },
  retryButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  retryText: {
    fontSize: 12,
    color: '#00A8DF',
    fontWeight: '500'
  }
});

export default LocationDropdown;
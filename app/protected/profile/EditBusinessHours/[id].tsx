import React, { useState, useEffect } from 'react';
import { 
 View,
 Text,
 StyleSheet, 
 TouchableOpacity,
 ScrollView,
 ActivityIndicator,
 Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { colors } from '@/app/constants/theme';
import { showErrorToast, showSuccessToast } from '@/app/utils/toast';
import apiClient from '@/app/utils/apiClient';

interface BusinessData {
  _id: string;
  businessName: string;
  addresses: {
    _id: string;
    address: string;
  }[];
  businessHours: {
    _id: string;
    address: string;
    openingTime: string;
    closingTime: string;
    days: string[];
  }[];
}

interface AddressHourData {
    addressId: string;
    address: string;
    openingTime: string;
    closingTime: string;
    days: string[];
    businessHourId: string;
    checked: boolean;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];


const TIME_OPTIONS = [
  '6:00 AM', '6:30 AM', '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM',
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
  '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
  '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM',
  '10:00 PM', '10:30 PM', '11:00 PM'
];

export default function EditBusinessHours() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showOpeningTimeDropdown, setShowOpeningTimeDropdown] = useState<string | null>(null);
  const [showClosingTimeDropdown, setShowClosingTimeDropdown] = useState<string | null>(null);

  const [addressHours, setAddressHours] = useState<AddressHourData[]>([]);

  useEffect(() => {
    if (id) {
    fetchBusinessData();
    }
  }, [id]);

  const fetchBusinessData = async () => {
    try {
     if (!apiClient) {
        showErrorToast('API client is not initialized');
        return;
     }
     setLoading(true);
     const response = await apiClient.get('/api/business/my-businesses');
     const businesses = response.data || [];

     const selectedBusiness = businesses.find((b: BusinessData) => b._id === id);
     if (!selectedBusiness) {
        showErrorToast('Business not found');
        router.back();
        return;
     }

     setBusiness(selectedBusiness);
     populateExistingHours(selectedBusiness);

    } catch (error: any) {
      console.error('Error fetching business data:', error);
      showErrorToast('Failed to load business data');
      router.back();
    } finally {
        setLoading(false);
    }
  };

  const populateExistingHours = (businessData: BusinessData) => {
    const addressHoursData: AddressHourData[] = [];

    businessData.addresses.forEach((address, index) => {
        // Find corresponding businesshours for this address
        const exisitingHours = businessData.businessHours[index];

        let actualAddress = address.address;

        // Parse the stringified address from business hour if needed 
        if (exisitingHours?.address) {
            try {
             const addressMatch = exisitingHours.address.match(/address: '([^']+)'/);
             if (addressMatch) {
                actualAddress = addressMatch[1];   
             }
            } catch (error: any) {
               console.error('Error parsing address:', error);
            }
        }

        addressHoursData.push({
            addressId: address._id,
            address: actualAddress,
            openingTime: exisitingHours?.openingTime || '',
            closingTime: exisitingHours?.closingTime || '',
            days: exisitingHours?.days || [],
            businessHourId: exisitingHours?._id || '',
            checked: true,
        });
    });

    setAddressHours(addressHoursData);  
  };

  const toggleDay = (day: string, addressId: string) => {
     setAddressHours(prev => prev.map(item => {
      if (item.addressId === addressId) {
        const newDays = item.days.includes(day) 
          ? item.days.filter(d => d !== day)
          : [...item.days, day];
        return { ...item, days: newDays };
      }
      return item;
    }));
  };

   const updateTime = (addressId: string, timeType: 'opening' | 'closing', time: string) => {
    setAddressHours(prev => prev.map(item => {
      if (item.addressId === addressId) {
        return {
          ...item,
          [timeType === 'opening' ? 'openingTime' : 'closingTime']: time
        };
      }
      return item;
    }));
    
    setShowOpeningTimeDropdown(null);
    setShowClosingTimeDropdown(null);
  };

   const validateHours = () => {
    for (const addressHour of addressHours) {
      if (!addressHour.openingTime || !addressHour.closingTime) {
        showErrorToast(`Please set opening and closing times for ${addressHour.address}`);
        return false;
      }
      if (addressHour.days.length === 0) {
        showErrorToast(`Please select at least one day for ${addressHour.address}`);
        return false;
      }
    }
    return true;
  };


  const handleSave = async () => {
    if (!validateHours()) return;
    
    try {
        if (!apiClient) {
           showErrorToast('API Client not initialized');
           return;
        }
      setSaving(true);
      
      // Format data for API - same as create business hours
      const hoursData = addressHours.map(item => ({
        openingTime: item.openingTime,
        closingTime: item.closingTime,
        days: item.days
      }));
      
      console.log('Updating business hours:', { businessHours: hoursData });
      
      await apiClient.put(`/api/business/${business?._id}/hours`, {
        businessHours: hoursData
      });
      
      showSuccessToast('Business hours updated successfully!');
      setTimeout(() => {
        router.push('/protected/profile/BusinessHours' as any);
      }, 1500);
      
    } catch (error: any) {
      console.error('Error updating business hours:', error);
      console.error('Error response:', error.response?.data);
      showErrorToast(error.response?.data?.message || 'Failed to update business hours');
    } finally {
      setSaving(false);
    }
  };

  const TimeDropdown = ({ 
    visible, 
    onSelect, 
    onClose,
    addressId,
    timeType 
  }: {
    visible: boolean;
    onSelect: (time: string) => void;
    onClose: () => void;
    addressId: string;
    timeType: 'opening' | 'closing';
  }) => {
    if (!visible) return null;
    
    return (
      <View style={styles.dropdownOverlay}>
        <TouchableOpacity style={styles.dropdownBackdrop} onPress={onClose} />
        <View style={styles.dropdownContent}>
          <ScrollView style={styles.timeList}>
            {TIME_OPTIONS.map(time => (
              <TouchableOpacity
                key={time}
                style={styles.timeOption}
                onPress={() => onSelect(time)}
              >
                <Text style={styles.timeOptionText}>{time}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  const AddressHourForm = ({ addressHour, index }: { addressHour: AddressHourData; index: number }) => (
    <View key={addressHour.addressId} style={styles.addressCard}>
      <View>
        <View style={styles.checkContainer}>
           <TouchableOpacity 
              style={[styles.checkbox, checked && styles.checkboxChecked]}
         onPress={() => {
            setAddressHours(prev => prev.map(item => 
                item.addressId === addressHour.addressId
                ? { ...item, checked: !item.checked}
                : item
            ));
         }}
             >
               {addressHour.checked && <Text style={styles.checkmark}>✓</Text>}
           </TouchableOpacity>
            <Text style={styles.addressTitle}>{addressHour.address}</Text>
        </View>
      </View>
      
      {/* Time Selection */}
      <View style={styles.timeRow}>
        <View style={styles.timeColumn}>
          <Text style={styles.timeLabel}>Opening time</Text>
          <TouchableOpacity
            style={styles.timeSelector}
            onPress={() => setShowOpeningTimeDropdown(addressHour.addressId)}
          >
            <Text style={[styles.timeSelectorText, !addressHour.openingTime && styles.placeholder]}>
              {addressHour.openingTime || 'Select'}
            </Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.timeColumn}>
          <Text style={styles.timeLabel}>Closing time</Text>
          <TouchableOpacity
            style={styles.timeSelector}
            onPress={() => setShowClosingTimeDropdown(addressHour.addressId)}
          >
            <Text style={[styles.timeSelectorText, !addressHour.closingTime && styles.placeholder]}>
              {addressHour.closingTime || 'Select'}
            </Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Days Selection */}
      <View style={styles.daysContainer}>
        {DAYS_OF_WEEK.map(day => (
          <TouchableOpacity
            key={day}
            style={[
              styles.dayButton,
              addressHour.days.includes(day) && styles.dayButtonSelected
            ]}
            onPress={() => toggleDay(day, addressHour.addressId)}
          >
            <Text style={[
              styles.dayButtonText,
              addressHour.days.includes(day) && styles.dayButtonTextSelected
            ]}>
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Time Dropdowns */}
      <TimeDropdown
        visible={showOpeningTimeDropdown === addressHour.addressId}
        onSelect={(time) => updateTime(addressHour.addressId, 'opening', time)}
        onClose={() => setShowOpeningTimeDropdown(null)}
        addressId={addressHour.addressId}
        timeType="opening"
      />
      
      <TimeDropdown
        visible={showClosingTimeDropdown === addressHour.addressId}
        onSelect={(time) => updateTime(addressHour.addressId, 'closing', time)}
        onClose={() => setShowClosingTimeDropdown(null)}
        addressId={addressHour.addressId}
        timeType="closing"
      />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            {/* <Text style={styles.backIcon}>←</Text> */}
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Business Hours</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1031AA" />
          <Text style={styles.loadingText}>Loading business hours...</Text>
        </View>
      </SafeAreaView>
    );
  }

   return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          {/* <Text style={styles.backIcon}>←</Text> */}
          <AntDesign name="arrow-left" size={20} color={colors.darkGray} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Business hours</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.businessName}>
          {business?.businessName || 'Business'}
        </Text>

        <View style={styles.multipleAddressForm}>
          {addressHours.map((addressHour, index) => (
            <AddressHourForm key={addressHour.addressId} addressHour={addressHour} index={index} />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          <LinearGradient
            colors={saving ? ['#cccccc', '#999999'] : ['#00A8DF', '#1031AA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.saveButton, saving && styles.disabledButton]}
          >
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <View style={{ flexDirection: 'row', gap: 4,}}>
                <Image 
                   source={require('../../../../assets/images/tick-circle.png')}
                />
                <Text style={styles.saveButtonText}>Save</Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgTheme,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backIcon: {
    fontSize: 24,
    color: colors.grey700,
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.darkGray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.lightGrey,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  businessName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.darkGray,
    fontFamily: 'WorkSans_500Medium',
    marginVertical: 20,
  },
  multipleAddressForm: {
    marginBottom: 30,
  },
  addressCard: {
      borderRadius: 8,
  //  padding: 8,
    marginBottom: 20,
  },
   checkContainer: {
   flexDirection: 'row', 
   alignItems: 'center', 
   marginBottom: 10, 
  },
   addressCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
 checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 10,
    borderWidth: 2,
    borderColor: "#525252",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#525252",
  },
  checkmark: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  checkboxText: {
    fontSize: 16,
    color: "#000",
  },
   addressTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.darkGray,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  timeColumn: {
    flex: 1,
    marginHorizontal: 5,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.darkGray,
    marginBottom: 8,
    fontFamily: 'WorkSans_500Medium'
  },
  timeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.bg,
  },
  timeSelectorText: {
    fontSize: 14,
    color: colors.darkGray,
  },
  placeholder: {
    color: colors.border,
  },
  dropdownArrow: {
    fontSize: 12,
    color: colors.border,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  dayButtonSelected: {
    backgroundColor: '#1031AA',
    borderColor: '#1031AA',
  },
  dayButtonText: {
    fontSize: 14,
    color: colors.darkGray,
  },
  dayButtonTextSelected: {
    color: colors.bg,
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  dropdownBackdrop: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dropdownContent: {
    position: 'absolute',
    top: '30%',
    left: 20,
    right: 20,
    backgroundColor: colors.bg,
    borderRadius: 8,
    maxHeight: 300,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  timeList: {
    maxHeight: 250,
  },
  timeOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  timeOptionText: {
    fontSize: 16,
    color: colors.darkGray,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  saveButton: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.bg,
  },
});
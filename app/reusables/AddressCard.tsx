import React from 'react';
import { 
 View, 
 Text,
 TextInput,
 TouchableOpacity,
 StyleSheet
} from 'react-native';
import LocationDropdown from './locationDropdown';
import { colors } from '../constants/theme';

interface AddressInput {
    id: string;
    state: string;
    lga: string;
    address: string;
}


 interface AddressCarProps {
    address: AddressInput;
    index: number;
    canRemove: boolean;
    onRemove: (id: string) => void;
    onUpdate: (id: string, field: keyof AddressInput, value: string) => void;
 }

 const AddressCard: React.FC<AddressCarProps> = ({
    address,
    index,
    canRemove,
    onRemove,
    onUpdate
 }) => {
    return (
        <View style={styles.addressCard}>
         <View style={styles.addressHeader}>
           <Text style={styles.addressTitle}>Address {index + 1}</Text>
           {canRemove && (
            <TouchableOpacity
             onPress={() => onRemove(address.id)}
             style={styles.cancelButton}
            >
              <Text style={styles.cancelIcon}>x</Text>
            </TouchableOpacity>
           )}
         </View>

         <View style={styles.inputGroup}>
           <LocationDropdown
             label="State"
             type="state"
             selectedValue={address.state}
             onSelect={(value) => onUpdate(address.id, "state", value)}
           />
         </View>

         <View style={styles.inputGroup}>
           <LocationDropdown
             label="Local Government Area"
             type="lga"
             selectedValue={address.lga}
             selectedState={address.state}
             onSelect={(value) => onUpdate(address.id, "lga",value)}
           />
         </View>

         <View style={styles.inputGroup}>
          <Text style={styles.label}>Address</Text>
          <TextInput 
            style={[styles.input, styles.addressInput]}
            placeholder="Enter your business address"
            placeholderTextColor={colors.border}
            value={address.address}
            onChangeText={(value) => onUpdate(address.id, "address", value)}
          />
         </View>
        </View>
      );
 }

const styles = StyleSheet.create({
  addressCard: {
    borderRadius: 8,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    fontSize: 14,
    fontWeight: '500',
    elevation: 1,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.darkGray,
    fontFamily: 'WorkSans_500Medium'
  },
  cancelButton: {
    backgroundColor: colors.red,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelIcon: {
    color: colors.bg,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkGray,
    marginBottom: 8,
    fontFamily: 'WorkSans_600SemiBold'
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    fontWeight: '400',
    color: colors.darkGray,
  },
  addressInput: {
    height: 52,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
});

 export default AddressCard;
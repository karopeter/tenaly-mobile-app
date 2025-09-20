import React from 'react';
import {
 View, 
 ScrollView, 
 Text, 
 TextInput,
  StyleSheet, 
  Image,
   TouchableOpacity,
   ActivityIndicator,
   Alert
} from 'react-native';
import { colors } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { BusinessData, DeliveryFormData } from '../types/businessData';

const DeliveryConfigurationForm = ({
    selectedBusiness,
    deliveryForm,
    setDeliveryForm,
    handleSaveDeliverySettings,
    saving 
}: {
    
  selectedBusiness: BusinessData;
  deliveryForm: DeliveryFormData;
  setDeliveryForm:  React.Dispatch<React.SetStateAction<DeliveryFormData>>;
  handleSaveDeliverySettings: () => void;
  saving: boolean;
}) => {
 
    return (
           <ScrollView style={styles.formContainer}>
                <Text style={styles.formTitle}>{selectedBusiness.businessName}</Text>
                
                {/* Selected addresses display */}
                {selectedBusiness.addresses.filter(addr => addr.deliveryAvailable).map((address) => (
                  <View 
                    key={address._id} 
                    style={styles.selectedAddressRow}>
                    <View style={styles.checkboxSelected}>
                      <Text style={styles.checkmark}>✓</Text>
                    </View>
                     <Text style={styles.selectedAddressText}>{address.address}</Text>
                  </View>
                ))}
                
                {/* Delivery explanation */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Delivery explanation</Text>
                  <TextInput
                    style={styles.textArea}
                    placeholder="We deliver only to Lagos or we deliver world wide. You will pay for delivery fee to the dispatch ride when it gets to you"
                    placeholderTextColor={colors.border}
                    value={deliveryForm.explanation}
                    onChangeText={(text) => setDeliveryForm(prev => ({ ...prev, explanation: text }))}
                    multiline
                    numberOfLines={3}
                  />
                </View>
                
                {/* Number of days */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Number of days it takes to be delivered</Text>
                  <View style={styles.daysRow}>
                    <View style={styles.daysInputContainer}>
                      <Text style={styles.daysLabel}>From</Text>
                      <TextInput
                        style={styles.daysInput}
                        placeholder="2 days"
                        placeholderTextColor={colors.border}
                        value={deliveryForm.dayFrom}
                        onChangeText={(text) => setDeliveryForm(prev => ({ ...prev, dayFrom: text }))}
                        keyboardType="numeric"
                      />
                      {/* <Text style={styles.daysText}>days</Text> */}
                    </View>
                    
                    <View style={styles.daysInputContainer}>
                      <Text style={styles.daysLabel}>To</Text>
                      <TextInput
                        style={styles.daysInput}
                        placeholder="7 days"
                        placeholderTextColor={colors.border}
                        value={deliveryForm.daysTo}
                        onChangeText={(text) => setDeliveryForm(prev => ({ ...prev, daysTo: text }))}
                        keyboardType="numeric"
                      />
                      {/* <Text style={styles.daysText}>days</Text> */}
                    </View>
                  </View>
                </View>
                
                {/* Charge for delivery */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Do you charge for delivery?</Text>
                  <TouchableOpacity
                    style={styles.dropdownSelector}
                    onPress={() => {
                      Alert.alert(
                        'Charge for delivery',
                        'Do you charge for delivery?',
                        [
                          { text: 'Yes', onPress: () => setDeliveryForm(prev => ({ ...prev, chargeDelivery: 'yes' })) },
                          { text: 'No', onPress: () => setDeliveryForm(prev => ({ ...prev, chargeDelivery: 'no' })) }
                        ]
                      );
                    }}>
                    <Text style={styles.dropdownText}>
                      {deliveryForm.chargeDelivery === 'yes' ? 'Yes' : 'No'}
                    </Text>
                    <Text style={styles.dropdownArrow}>▼</Text>
                  </TouchableOpacity>
                </View>
                
                {/* Delivery fees (if charging) */}
                {deliveryForm.chargeDelivery === 'yes' && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>How much will the buyer pay for delivery fee</Text>
                    <View style={styles.feeRow}>
                      <View style={styles.feeInputContainer}>
                        <Text style={styles.feeLabel}>From</Text>
                        <TextInput
                          style={styles.feeInput}
                          placeholder="₦ 3000"
                          placeholderTextColor={colors.border}
                          value={deliveryForm.feeFrom}
                          onChangeText={(text) => setDeliveryForm(prev => ({ ...prev, feeFrom: text }))}
                          keyboardType="numeric"
                        />
                      </View>
                      
                      <View style={styles.feeInputContainer}>
                        <Text style={styles.feeLabel}>To</Text>
                        <TextInput
                          style={styles.feeInput}
                          placeholder="₦ 5000"
                          placeholderTextColor={colors.border}
                          value={deliveryForm.feeTo}
                          onChangeText={(text) => setDeliveryForm(prev => ({ ...prev, feeTo: text }))}
                          keyboardType="numeric"
                        />
                      </View>
                    </View>
                  </View>
                )}
                
                {/* Save button */}
                <View style={styles.saveButtonContainer}>
                  <TouchableOpacity onPress={handleSaveDeliverySettings} disabled={saving}>
                    <LinearGradient
                      colors={saving ? ['#cccccc', '#999999'] : ['#00A8DF', '#1031AA']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.saveButton}
                    >
                      {saving ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                       <View style={styles.buttonContainer}>
                        <Image 
                          source={require('../../assets/images/tick-circle.png')}
                        />
                         <Text style={styles.saveButtonText}>Save</Text>
                       </View>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </ScrollView>
    );
}

const styles = StyleSheet.create({
 formContainer: {
     flex: 1,
     paddingTop: 20,
   },
   formTitle: {
     fontSize: 18,
     fontWeight: '600',
     color: colors.darkGray,
     marginBottom: 20,
   },
   selectedAddressRow: {
     flexDirection: 'row',
     alignItems: 'center',
     marginBottom: 16,
     backgroundColor: colors.bg,
     padding: 12,
     borderRadius: 8,
   },
   selectedAddressText: {
     fontSize: 14,
     color: colors.darkGray,
     marginLeft: 10,
     fontWeight: '400'
   },
   inputGroup: {
     marginBottom: 24,
   },
   inputLabel: {
     fontSize: 14,
     fontWeight: '600',
     color: colors.darkGray,
     marginBottom: 8,
   },
    checkboxSelected: {
    backgroundColor: '#1031AA',
    width: 20,
    height: 20,
    borderWidth: 0,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: colors.bg,
    fontSize: 12,
    fontWeight: 'bold',
  },
  saveButton:{
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.darkGray,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  daysInputContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  daysLabel: {
    fontSize: 12,
    color: colors.darkGray,
    marginBottom: 4,
  },
  daysInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.darkGray,
    textAlign: 'left',
  },
  daysText: {
    fontSize: 12,
    color: colors.darkGray,
    marginTop: 4,
    textAlign: 'center',
  },
  dropdownSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dropdownText: {
    fontSize: 14,
    color: colors.darkGray,
  },
  dropdownArrow: {
    fontSize: 12,
    color: colors.border,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  feeInputContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  feeLabel: {
    fontSize: 12,
    color: colors.darkGray,
    marginBottom: 4,
  },
  feeInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.darkGray,
  },
  buttonContainer: {
   flexDirection: "row", 
   alignItems: 'center',
   gap: 8,
  },
  saveButtonText: {
    color: colors.bg,
    fontWeight: '600',
    fontSize: 16,
  }
})

export default DeliveryConfigurationForm;
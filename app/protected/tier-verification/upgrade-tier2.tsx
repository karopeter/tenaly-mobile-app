import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { useLocations } from '@/app/hook/location';
import { colors } from '@/app/constants/theme';
import { useSubmitTier2 } from '@/app/hook/tier';
import GradientButton from '@/app/components/GradientButton/GradientButton';

const UpgradeTier2: React.FC = () => {
  const router = useRouter();
  const { mutate: submitTier2, isPending } = useSubmitTier2();
  const { data: locations = [], isLoading: isLoadingLocations } = useLocations();
  const [showStatePicker, setShowStatePicker] = useState<boolean>(false);
  const [showLgaPicker, setShowLgaPicker] = useState<boolean>(false);
  const [selectedStateId, setSelectedStateId] = useState<string>('');

  // Get LGAs for selected state 
  const selectedStateData = locations.find(loc => loc._id === selectedStateId);
  const availableLgas = selectedStateData?.lgas || [];

  const [state, setState] = useState('');
  const [lga, setLga] = useState('');
  const [town, setTown] = useState('');
  const [address, setAddress] = useState('');
  const [document, setDocument] = useState<any>(null);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setDocument(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
    }
  };

  const handleSubmit = () => {
    if (!state || !lga || !town || !address || !document) {
      alert('Please fill all required fields');
      return;
    }

    const data = {
      state,
      lga,
      town,
      address,
      utilityBill: {
        uri: document.uri,
        name: document.name,
        type: document.mimeType || 'application/octet-stream',
      },
    };

    submitTier2(data, {
      onSuccess: () => {
        router.back();
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <AntDesign name="arrow-left" size={20} color={colors.darkGray} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upgrade to Tier 2</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.description}>
          Proof of business address
        </Text>
        <Text style={styles.descriptionSub}>
          Please upload a proof of your business address (utility bill) that contains your
          address. Kindly ensure that the state, LGA and area you select matches that of your
          utility bill you will upload
        </Text>

        {/* State */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>State</Text>
          <TouchableOpacity
           style={styles.picker}
           onPress={() => setShowStatePicker(!showStatePicker)}
          >
           <Text style={[styles.pickerText, !state && styles.placeholder]}>
            {state || 'Select'}
           </Text>
           <AntDesign name="down" size={14} color={colors.lightGray} />
          </TouchableOpacity>

          {showStatePicker && (
         <View style={styles.pickerOptions}>
           <ScrollView 
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={true}
           >
        {locations.map((location) => (
          <TouchableOpacity
          key={location._id}
          style={styles.pickerOption}
          onPress={() => {
            setState(location.state);
            setSelectedStateId(location._id);
            setLga('');
            setShowStatePicker(false);
          }}
        >
          <Text style={styles.pickerOptionText}>{location.state}</Text>
        </TouchableOpacity>
      ))}
       </ScrollView>
      </View>
    )}
  </View>

        {/* LGA */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>LGA</Text>
          <TouchableOpacity 
            style={styles.picker}
            onPress={() => {
                if (availableLgas.length > 0) {
                  setShowLgaPicker(!showLgaPicker);
                }
            }}
            disabled={!selectedStateId}
            >
             <Text style={[styles.pickerText, (!lga || !selectedStateId) && styles.placeholder]}>
                 {lga || (selectedStateId ? 'Select' : 'Select state first')}
              </Text>
            <AntDesign name="down" size={14} color={colors.lightGray} />
          </TouchableOpacity>
          {showLgaPicker && availableLgas.length > 0 && (
  <View style={styles.pickerOptions}>
    <ScrollView 
      nestedScrollEnabled={true}
      showsVerticalScrollIndicator={true}
    >
      {availableLgas.map((lgaName, index) => (
        <TouchableOpacity
          key={index}
          style={styles.pickerOption}
          onPress={() => {
            setLga(lgaName);
            setShowLgaPicker(false);
          }}
        >
          <Text style={styles.pickerOptionText}>{lgaName}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
)}
        </View>

        {/* Town */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Town</Text>
           <TextInput
             style={styles.input}
             value={town}
             onChangeText={setTown}
             placeholder='Enter Town'
             placeholderTextColor="#4C4C4C"
           />
        </View>

        {/* Address */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Address <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={address}
            onChangeText={setAddress}
            placeholder="Enter your business address"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Document Upload */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Upload utility bill</Text>
          <TouchableOpacity style={styles.uploadBox} onPress={handlePickDocument}>
             <Image source={require('../../../assets/images/document-upload.png')} />
            {/* <Feather name="upload-cloud" size={32} color="#0D7BC2" /> */}
            <Text style={styles.uploadText}>
              {document ? document.name : 'Upload Document'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <View style={{ marginTop: 20, marginBottom: 30,}}>
          <GradientButton
            title={isPending ? 'Submitting...' : 'Submit'}
            onPress={handleSubmit}
            disabled={isPending}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgTheme,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: colors.bg,
    paddingTop: 30,
    paddingBottom: 20,
    shadowColor: colors.blueGrey,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    elevation: 6,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.darkGray,
    fontFamily: 'WorkSans_600SemiBold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.blue,
    fontFamily: 'WorkSans_600SemiBold',
    marginBottom: 10,
  },
  descriptionSub: {
    fontSize: 14,
    color: '#868686',
    fontWeight: '600',
    fontFamily: 'WorkSans_500Medium',
    lineHeight: 20,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.darkGray,
    fontFamily: 'WorkSans_500Medium',
    marginBottom: 8,
  },
  required: {
    color: '#DC2626',
  },
  input: {
     borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    paddingHorizontal: 15,
    paddingVertical: 17,
    fontSize: 16,
    color: colors.black,
  },
  textArea: {
    height: 100,
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 4,
    paddingVertical: 15,
    paddingHorizontal: 17,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pickerText: {
    fontSize: 14,
    color: colors.darkGray,
    fontFamily: 'WorkSans_400Regular',
  },
  pickerOptions: {
  backgroundColor: colors.bg,
  borderRadius: 8,
  marginTop: 5,
  borderWidth: 1,
  borderColor: '#E5E7EB',
  maxHeight: 200, 
  overflow: 'hidden',
},
pickerOption: {
  paddingVertical: 12,
  paddingHorizontal: 15,
  borderBottomWidth: 1,
  borderBottomColor: '#F3F4F6',
},
pickerOptionText: {
  fontSize: 14,
  color: colors.darkGray,
  fontFamily: 'WorkSans_400Regular',
},
  placeholder: {
    color: '#9CA3AF',
  },
  uploadBox: {
    backgroundColor: '#F7F7FF',
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#5555DD',
    paddingVertical: 40,
    alignItems: 'center',
  },
  uploadText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000087',
    fontFamily: 'WorkSans_500Medium',
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: '#0D7BC2',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  disabledButton: {
    backgroundColor: '#D1D5DB',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    fontFamily: 'WorkSans_600SemiBold',
  },
});

export default UpgradeTier2;
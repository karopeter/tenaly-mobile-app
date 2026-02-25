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
import { AntDesign, Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { colors } from '@/app/constants/theme';
import { useSubmitTier3, useBusinesses } from '@/app/hook/tier';
import GradientButton from '@/app/components/GradientButton/GradientButton';

const UpgradeTier3: React.FC = () => {
  const router = useRouter();
  const { mutate: submitTier3, isPending } = useSubmitTier3();
  const { data: businesses = [] } = useBusinesses();

  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [cacNumber, setCacNumber] = useState('');
  const [tinNumber, setTinNumber] = useState('');
  const [businessLicenseNumber, setBusinessLicenseNumber] = useState('');
  const [cacDocument, setCacDocument] = useState<any>(null);
  const [otherDocument, setOtherDocument] = useState<any>(null);
  const [showBusinessPicker, setShowBusinessPicker] = useState(false);

  const handlePickCacDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCacDocument(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
    }
  };

  const handlePickOtherDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setOtherDocument(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
    }
  };

  const handleSubmit = () => {
    if (!selectedBusinessId || !cacNumber || !tinNumber || !businessLicenseNumber || !cacDocument) {
      alert('Please fill all required fields');
      return;
    }

    const data = {
      businessId: selectedBusinessId,
      cacNumber,
      tinNumber,
      businessLicenseNumber,
      cacDocument: {
        uri: cacDocument.uri,
        name: cacDocument.name,
        type: cacDocument.mimeType || 'application/octet-stream',
      },
      ...(otherDocument && {
        otherDocument: {
          uri: otherDocument.uri,
          name: otherDocument.name,
          type: otherDocument.mimeType || 'application/octet-stream',
        },
      }),
    };

    submitTier3(data, {
      onSuccess: () => {
        router.back();
      },
    });
  };

  const selectedBusiness = businesses.find((b) => b._id === selectedBusinessId);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <AntDesign name="arrow-left" size={20} color={colors.darkGray} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upgrade to Tier 3</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.description}>Business Verification</Text>

        {/* Select Business */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Select business</Text>
          <TouchableOpacity
            style={styles.picker}
            onPress={() => setShowBusinessPicker(!showBusinessPicker)}
          >
            <Text style={[styles.pickerText, !selectedBusinessId && styles.placeholder]}>
              {selectedBusiness ? selectedBusiness.businessName : 'Select'}
            </Text>
            <AntDesign name="down" size={14} color={colors.lightGray} />
          </TouchableOpacity>

          {showBusinessPicker && (
            <View style={styles.pickerOptions}>
              {businesses.map((business) => (
                <TouchableOpacity
                  key={business._id}
                  style={styles.pickerOption}
                  onPress={() => {
                    setSelectedBusinessId(business._id);
                    setShowBusinessPicker(false);
                  }}
                >
                  <Text style={styles.pickerOptionText}>{business.businessName}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* CAC Number */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Corporate Affairs Commission (CAC) Number</Text>
          <TextInput
            style={styles.input}
            value={cacNumber}
            onChangeText={setCacNumber}
            placeholder="Enter"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* TIN Number */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tax Identification Number (TIN)</Text>
          <TextInput
            style={styles.input}
            value={tinNumber}
            onChangeText={setTinNumber}
            placeholder="Enter"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Business License Number */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Business licence number <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={businessLicenseNumber}
            onChangeText={setBusinessLicenseNumber}
            placeholder="Enter"
            placeholderTextColor="#4C4C4C"
          />
        </View>

        {/* CAC Document */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Upload Corporate Affairs Commission (CAC)</Text>
          <TouchableOpacity style={styles.uploadBox} onPress={handlePickCacDocument}>
             <Image source={require('../../../assets/images/document-upload.png')} />
            {/* <Feather name="upload-cloud" size={32} color="#0D7BC2" /> */}
            <Text style={styles.uploadText}>
              {cacDocument ? cacDocument.name : 'Upload Document'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Other Document (Optional) */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Upload other necessary document (optional)
          </Text>
          <TouchableOpacity style={styles.uploadBox} onPress={handlePickOtherDocument}>
            {/* <Feather name="upload-cloud" size={32} color="#0D7BC2" /> */}
            <Text style={styles.uploadText}>
              {otherDocument ? otherDocument.name : 'Upload Document'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <View style={{ marginTop: 20, marginBottom: 30,}}>
          <GradientButton
            title={isPending ? 'Submitting...' :  'Submit'}
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
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    paddingHorizontal: 15,
    paddingVertical: 17,
    fontSize: 16,
    color: colors.black,
  },
  pickerText: {
    fontSize: 14,
    color: colors.darkGray,
    fontFamily: 'WorkSans_400Regular',
  },
  placeholder: {
    color: '#9CA3AF',
  },
  pickerOptions: {
    backgroundColor: colors.bg,
    borderRadius: 8,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
});

export default UpgradeTier3;
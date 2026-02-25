import React, { useState } from 'react';
import { 
 View,
 Text,
 TextInput,
 TouchableOpacity,
 StyleSheet,
 StatusBar,
 ScrollView,
 Image
 } from 'react-native';
 import { AntDesign } from '@expo/vector-icons';
 import { SafeAreaView } from 'react-native-safe-area-context';
 import * as DocumentPicker from 'expo-document-picker';
 import { colors } from '@/app/constants/theme';
 import GradientButton from '@/app/components/GradientButton/GradientButton';
 import { useSubmitTier1 } from '@/app/hook/tier';
 import { IdType } from '@/app/types/tier.types';
 import { useRouter } from 'expo-router';

 const UpgradeTier1: React.FC = () => {
    const router = useRouter();
    const { mutate: submitTier1, isPending } = useSubmitTier1();

    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [idType, setIdType] = useState<IdType | ''>('');
    const [document, setDocument] = useState<any>(null);
    const [showIdTypePicker, setShowIdTypePicker] = useState(false);

    const idTypes: { value: IdType; label: string }[] = [
         { value: 'nin', label: 'National Identity Number (NIN)' },
         { value: 'drivers-license', label: "Driver's License" },
        { value: 'voters-card', label: "Voter's Card" },
        { value: 'passport', label: 'International Passport' }, 
    ];

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
        if (!email || !phone || !idType || !document) {
         alert('Please fill all required fields');
         return;
        }

        const data = {
          email,
          phone,
          idType,
          idDocument: {
           uri: document.uri,
           name: document.name,
           type: document.mimeType || 'application/octet-stream',
          },
        };

        submitTier1(data, {
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
        <Text style={styles.headerTitle}>Upgrade to Tier 1</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Email */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="golibe.f@gmail.com"
            placeholderTextColor="#4C4C4C"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Phone */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone number</Text>
          <View style={styles.phoneContainer}>
            <Text style={styles.countryCode}>+234</Text>
            <TextInput
              style={styles.phoneInput}
              value={phone}
              onChangeText={setPhone}
              placeholder="7098989790"
              placeholderTextColor="#4C4C4C"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* ID Type */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Valid means of ID <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.picker}
            onPress={() => setShowIdTypePicker(!showIdTypePicker)}
          >
            <Text style={[styles.pickerText, !idType && styles.placeholder]}>
              {idType
                ? idTypes.find((t) => t.value === idType)?.label
                : 'Select'}
            </Text>
            <AntDesign name="down" size={14} color={colors.lightGray} />
          </TouchableOpacity>

          {showIdTypePicker && (
            <View style={styles.pickerOptions}>
              {idTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={styles.pickerOption}
                  onPress={() => {
                    setIdType(type.value);
                    setShowIdTypePicker(false);
                  }}
                >
                  <Text style={styles.pickerOptionText}>{type.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Document Upload */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Upload valid means of ID</Text>
          <TouchableOpacity style={styles.uploadBox} onPress={handlePickDocument}>
            <Image source={require('../../../assets/images/document-upload.png')} />
            {/* <Feather name="upload-cloud" size={32} color="#0D7BC2" /> */}
            <Text style={styles.uploadText}>
              {document ? document.name : 'Upload Document'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <View style={{ marginTop: 20, marginBottom: 30, }}>
          <GradientButton 
            title={isPending ? 'Submitting...' : 'Submit'}
            onPress={handleSubmit}
            disabled={isPending}
          />
        </View>
      </ScrollView>
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
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 15,
  },
  countryCode: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.darkGray,
    fontFamily: 'WorkSans_500Medium',
    marginRight: 10,
  },
  phoneInput: {
    flex: 1,
    paddingVertical: 17,
    fontSize: 14,
    color: colors.darkGray,
    fontFamily: 'WorkSans_400Regular',
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 4,
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: colors.border,
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

export default UpgradeTier1;
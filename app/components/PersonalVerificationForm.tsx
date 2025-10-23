import React, { useState } from 'react';
import { 
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert 
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from  'expo-image-picker';
import RNPickerSelect from 'react-native-picker-select';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../constants/theme';
import { DocumentFile } from '../types/verification.types';
import { showErrorToast, showSuccessToast } from '../utils/toast';


interface PersonalVerificationFormProps {
    onSubmit: (validIdType: string, validIdFile: DocumentFile) => Promise<void>;
    onBack: () => void;
}


const PersonalVerificationForm: React.FC<PersonalVerificationFormProps> = ({
    onSubmit,
    onBack,
}) => {
   const [validIdType, setValidIdType] = useState('nin');
   const [validIdFile, setValidIdFile] = useState<DocumentFile | null>(null);
   const [loading, setLoading] = useState(false);

   const idTypes = [
    { label: 'National Identification Number (NIN)', value: 'nin'},
    { label: 'Driver License', value: 'driverlicense' },
    { label: 'Passport', value: 'passport' },
    { label: 'Voters Card', value: 'voterscard' },
   ];

   const pickDocument = async () => {
     try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
         const asset = result.assets[0];

         // check file size (10mb LIMIT)
         if (asset.size && asset.size > 10 * 1024 * 1024) {
            showErrorToast('File size is too large. Please upload a document smaller than 10MB.');
            return;
         }

         const documentFile: DocumentFile = {
            uri: asset.uri,
            name: asset.name,
            type: asset.mimeType || 'application/octet-stream',
            size: asset.size,
         };
          setValidIdFile(documentFile);
          showSuccessToast('Document selected successfully');
      }
     } catch (error) {
       console.error('Document picker error:', error);
       showErrorToast('Failed to select document');
     }
   };

   const pickImage = async () => {
     try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert('Permission Required, Please allow access to your photo library');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const imageFile: DocumentFile = {
            uri: asset.uri,
            name: `validId_${Date.now()}.jpg`,
            type: 'image/jpeg',
        };
        setValidIdFile(imageFile);
        showSuccessToast('Image selected successfully');
      }
     } catch (error) {
      console.error('Image picker error:', error);
      showErrorToast('Failed to select image');
     }
   };

   const showDocumentOptions = () => {
     Alert.alert(
      'Select Document',
      'Choose how you want to add your document',
      [
        { text: 'Camera/Gallery', onPress: pickImage },
        { text: 'Files', onPress: pickDocument },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
   };

    const handleSubmit = async () => {
    if (!validIdFile) {
      showErrorToast('Please upload your valid ID');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(validIdType, validIdFile);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Verify your personal identity</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Valid means of ID</Text>
        <RNPickerSelect
          onValueChange={(value) => setValidIdType(value)}
          value={validIdType}
          items={idTypes}
          style={{
            inputIOS: styles.picker,
            inputAndroid: styles.picker,
            iconContainer: styles.pickerIcon,
          }}
          Icon={() => <Ionicons name="chevron-down" size={20} color="#666" />}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Upload valid means of ID (Max: 10MB)</Text>
        {!validIdFile ? (
          <TouchableOpacity style={styles.uploadButton} onPress={showDocumentOptions}>
            <Image source={require('../../assets/images/document-upload.png')} />
            <Text style={styles.uploadText}>Upload Document</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.selectedFileContainer}>
            {validIdFile.type.startsWith('image/') ? (
              <Image source={{ uri: validIdFile.uri }} style={styles.previewImage} />
            ) : (
              <View style={styles.filePreview}>
                <Ionicons name="document-outline" size={40} color="#007AFF" />
                <Text style={styles.fileName}>{validIdFile.name}</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => setValidIdFile(null)}
            >
              <Ionicons name="close-circle" size={24} color="#DC2626" />
            </TouchableOpacity>
            {validIdFile.size && (
              <Text style={styles.fileSize}>
                Size: {(validIdFile.size / (1024 * 1024)).toFixed(2)}MB
              </Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.submitButtonWrapper}
          onPress={handleSubmit}
          disabled={loading}
        >
          <LinearGradient
            colors={loading ? ['#cccccc', '#999999'] : ['#00A8DF', '#1031AA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitButton}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Submit</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.darkGray,
    marginVertical: 20,
    fontFamily: 'WorkSans_500Medium',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.darkGray,
    marginBottom: 8,
    fontFamily: 'WorkSans_500Medium',
  },
  picker: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    paddingHorizontal: 15,
    paddingVertical: 17,
    fontSize: 16,
    color: colors.black,
  },
  pickerIcon: {
    top: 18,
    right: 15,
  },
  uploadButton: {
    borderWidth: 1,
    borderColor: colors.prikyBlue,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blueGrey,
  },
  uploadText: {
    fontSize: 14,
    color: colors.blue,
    marginTop: 8,
    fontWeight: '500',
    fontFamily: 'WorkSans_500Medium',
  },
  selectedFileContainer: {
    borderWidth: 1,
    borderColor: colors.prikyBlue,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    backgroundColor: colors.blueGrey,
    position: 'relative',
  },
  previewImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  filePreview: {
    alignItems: 'center',
    padding: 20,
  },
  fileName: {
    marginTop: 8,
    fontSize: 12,
    color: colors.darkGray,
    textAlign: 'center',
    fontFamily: 'WorkSans_400Regular',
  },
  fileSize: {
    marginTop: 8,
    fontSize: 12,
    color: '#868686',
    fontFamily: 'WorkSans_400Regular',
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: colors.bg,
    borderRadius: 12,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  submitButtonWrapper: {
    width: '100%',
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: colors.bg,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'WorkSans_600SemiBold',
  },
});


export default PersonalVerificationForm;
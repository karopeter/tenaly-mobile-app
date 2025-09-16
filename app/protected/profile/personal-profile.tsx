import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { showErrorToast, showSuccessToast } from '@/app/utils/toast';
import apiClient from '@/app/utils/apiClient';
import { colors } from '@/app/constants/theme';
import { useRouter } from 'expo-router';

type SelectedImageFile = {
  uri: string;
  type: string;
  name: string;
} | null;

type ProfileData = {
  fullName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  image: string | null;
}

const PersonalProfileScreen = () => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [tempProfileImage, setTempProfileImage] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<SelectedImageFile>(null);
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    image: null,
  });
  const [editData, setEditData] = useState({ 
    fullName: '',
    email: '',
    phoneNumber: ''
  });

  // Extract first and last name for fullName 
  const getFirstLastName = (fullName: string) => {
    if (!fullName) return { firstName: '', lastName: '' };
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    return { firstName, lastName };
  };

  // Combine first and last name into FullName 
  const combineFullName = (firstName: string, lastName: string) => {
    return `${firstName} ${lastName}`.trim();
  };


  const fetchUserProfile = async () => {
     try {
       if (!apiClient) {
        showErrorToast('API client not initialized.');
        return;
       }
       setLoading(true);
        const response = await apiClient.get('/api/profile');
        if (!response.data) {
           showErrorToast('Failed to fetch profile');
        }
        const userData = await response.data;

        const updatedProfileData = {
            fullName: userData.fullName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            phoneNumber: userData.phoneNumber || '',
            image: userData.image || null,
        };

        setProfileData(updatedProfileData);
        setEditData(updatedProfileData);
        setProfileImage(userData.image);
     } catch (error) {
      console.error('Error fetching profile:', error);
      showErrorToast('Failed to load profile data');
     } finally {
        setLoading(false);
     }
  }

  useEffect(() => {
     fetchUserProfile();
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
     mediaTypes: ImagePicker.MediaTypeOptions.Images,
     allowsEditing: true,
     aspect: [1, 1],
     quality: 0.8,
     allowsMultipleSelection: false,
   });

   if (!result.canceled && result.assets && result.assets.length > 0) {
     const selectedImage = result.assets[0];
     setTempProfileImage(selectedImage.uri);
     setSelectedImageFile({
        uri: selectedImage.uri,
        type: selectedImage.type || "image/jpeg",
        name: selectedImage.fileName || "/profice-circle.png"
     });
   }
    } catch (error) {
       console.log('Error picking image:', error);
       showErrorToast('Error, Failed to pick Image. Please try again.');
    }
  };

  const cancelImage = () => {
    setTempProfileImage(null);
    setSelectedImageFile(null);
  };

  const handleSave = async () => {
    try {
      if (!apiClient) {
        showErrorToast('API client not initialized.');
        return;
      }
      setSaving(true);

      const { firstName, lastName } = getFirstLastName(editData.fullName);


      const formData = new FormData();
      formData.append('fullName', editData.fullName);
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('email', editData.email);
      formData.append('phoneNumber', editData.phoneNumber);

      // Add image if selected 
      if (selectedImageFile) {
        formData.append('image', {
            uri: selectedImageFile.uri,
            type: selectedImageFile.type,
            name: selectedImageFile.name,
        } as any);
      }

      const response = await apiClient.put('/api/profile/update-profile', formData, {
         headers: {
          'Content-Type': 'multipart/form-data',
         },
      });

      const result = await response.data;

      // Update local state with new dATA
      const updatedData = {
        fullName: result.user.fullName,
        lastName: result.user.lastName,
        email: result.user.email,
        phoneNumber: result.user.phoneNumber,
        image: result.user.image,
      };

      setProfileData(updatedData);
      setProfileImage(result.user.image);
      setTempProfileImage(null);
      setSelectedImageFile(null);
      setIsEditing(false);
      showSuccessToast('Profile updated successfully!');
    } catch (error: any) {
       console.error('Error updating profile:', error.response?.data || error.response);
       showErrorToast(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData({ ...profileData });
    setTempProfileImage(null);
    //router.back();
    setSelectedImageFile(null);
    setIsEditing(false);
  };

  const renderProfileImage = () => {
    const imageSource = tempProfileImage || profileImage;
    
    return (
      <View style={styles.profileCirclesContainer}>
        {/* Profile circles background */}
        <Image 
          source={require('../../../assets/images/profile-circles.png')}
          style={styles.profileCirclesImage}
        />
        
        {/* User's profile image overlay */}
        {imageSource && (
          <Image 
            source={{ uri: imageSource }} 
            style={styles.userProfileImage} 
          />
        )}
        
        {/* Camera icon for editing mode */}
        {isEditing && (
          <TouchableOpacity
            style={styles.cameraIcon}
            onPress={pickImage}
          >
            <Image 
               source={require('../../../assets/images/camera.png')}
            />
          </TouchableOpacity>
        )}
        
        {/* Cancel button for temp image */}
        {isEditing && tempProfileImage && (
          <TouchableOpacity
            style={styles.cancelImageButton}
            onPress={cancelImage}
          >
            <Text style={styles.cancelImageText}>×</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.skyBlue} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    )
  }

  if (isEditing) {
    const { firstName, lastName } = getFirstLastName(editData.fullName);


    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={handleCancel} disabled={saving}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Personal profile</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.editImageContainer}>
            {renderProfileImage()}
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={(text) => {
                  const { lastName: currentLastName } = getFirstLastName(editData.fullName);
                  const newFullName = combineFullName(text, currentLastName);
                  setEditData({ ...editData, fullName: newFullName });
                }}
                placeholder="First Name"
                editable={!saving}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={(text) => {
                  const { firstName: currentFirstName } = getFirstLastName(editData.fullName);
                  const newFullName = combineFullName(currentFirstName, text);
                  setEditData({ ...editData, fullName: newFullName });
                }}
                placeholder="Last Name"
                editable={!saving}
              />
            </View>
          </View>

          <View style={styles.fullWidthInputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.fullWidthInput}
              value={editData.email}
              onChangeText={(text) => setEditData({ ...editData, email: text })}
              placeholder="Email"
              keyboardType="email-address"
              editable={!saving}
            />
          </View>

          <View style={styles.fullWidthInputContainer}>
            <Text style={styles.label}>Phone number</Text>
            <TextInput
              style={styles.fullWidthInput}
              value={editData.phoneNumber}
              onChangeText={(text) => setEditData({ ...editData, phoneNumber: text })}
              placeholder="Phone number"
              keyboardType="phone-pad"
              editable={!saving}
            />
          </View>

        <TouchableOpacity onPress={handleSave}>
          <LinearGradient
            colors={saving ? ['#cccccc', '#999999'] : ['#00A8DF', '#1031AA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              paddingVertical: 12,
              marginBottom: 8,
              opacity: saving ? 0.7 : 1,
            }}>
             <View style={{ flexDirection: "row", gap: 4, alignItems: 'center' }}>
               {saving ? (
                <ActivityIndicator size="small" color="#fff" />
               ): (
                <Image 
                    source={require('../../../assets/images/tick-circle.png')}
                  />
               )}
               <Text style={styles.saveButtonText}>
                  {saving ? 'Saving...' : 'Save changes'}
                </Text>
             </View>
          </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  const { firstName, lastName } = getFirstLastName(profileData.fullName);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/protected/profile')}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal profile</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.profileSection}>
          {renderProfileImage()}
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
          >
            <View style={styles.editRow}>
              <Image
                source={require('../../../assets/images/user-edit.png')}
               />
             <Text style={styles.editButtonText}>
              Edit
            </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>First Name</Text>
            <Text style={styles.infoValue}>{firstName || 'Not Set'}</Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>Last Name</Text>
            <Text style={styles.infoValue}>{lastName || 'Not Set'}</Text>
          </View>
        </View>

        <View style={styles.fullWidthInfoContainer}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{profileData.email || 'Not Set'}</Text>
        </View>

        <View style={styles.fullWidthInfoContainer}>
          <Text style={styles.infoLabel}>Phone number</Text>
          <Text style={styles.infoValue}>{profileData.phoneNumber || 'Not Set'}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.setGrey,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: colors.bg,
    shadowColor: colors.blurGrey,
     paddingTop: 60,
    paddingBottom: 20,
    shadowOffset: { width: 0, height: 4, },
    shadowOpacity: 0.1,
    elevation: 6,
  },
  centerButton: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.blackGrey
  },
  backButton: {
    fontSize: 24,
    color: colors.grey300,
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.darkGray,
  },
  content: {
    paddingHorizontal: 20,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    gap: 15,
  },
  profileCirclesContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCirclesImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  userProfileImage: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    top: 20,
    left: 20,
  },
  editImageContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 10,
    right: 10,
   backgroundColor: colors.bg,
    borderRadius: 20,
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 3,
    borderColor: colors.setGrey,
  },
  cameraIconText: {
    fontSize: 16,
  },
  cancelImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: colors.red,
    borderRadius: 15,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelImageText: {
    color: colors.bg,
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: colors.heartGray,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.lightSpot,
  },
  editRow: {
    flexDirection: "row", 
    gap: 5, 
    alignItems: 'center'
  },
  editButtonText: {
    fontSize: 14,
    color: colors.darkGray,
    fontWeight: '500'
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 15,
  },
  infoContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.darkGray,
    marginBottom: 8,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    color: colors.grey600,
    paddingVertical: 12,
    fontWeight: '400',
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  fullWidthInfoContainer: {
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 15,
  },
  inputContainer: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: colors.darkGray,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    fontSize: 16,
    color: colors.blackGrey,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
  },
  fullWidthInputContainer: {
    marginBottom: 20,
  },
  fullWidthInput: {
    fontSize: 16,
    color: colors.blackGrey,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    marginBottom: 8,
  },
  saveButtonText: {
    color: colors.bg,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PersonalProfileScreen;
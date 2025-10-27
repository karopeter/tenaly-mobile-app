import React, { useState  } from 'react';
import { 
  View, 
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Platform,
  StatusBar
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import CategoryModal from '@/app/components/modals/CategoryModal';
import LocationModal from '@/app/components/modals/LocationModal';
import BusinessModal from '@/app/components/modals/BusinessModal';
import { colors } from '@/app/constants/theme';
import apiClient from '@/app/utils/apiClient';
import { showErrorToast } from '@/app/utils/toast';
import GradientButton from '@/app/components/GradientButton/GradientButton';


interface Business {
  _id: string;
  businessName: string;
}

interface ImageAssets {
  uri: string;
  id: string;
}

// Main Post Ad Screen 
export default function PostAdScreen() {
  const router = useRouter();
  const [category, setCategory]= useState('');
  const [location, setLocation]  = useState('');
  const [link, setLink] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [images, setImages] = useState<ImageAssets[]>([]);
  const [loading, setLoading] = useState(false);

  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [businessModalVisible, setBusinessModalVisible] = useState(false);
 
const pickImage = async () => {
   try {
     const result = await ImagePicker.launchImageLibraryAsync({
       mediaTypes: ImagePicker.MediaTypeOptions.Images,
       allowsEditing: true,
       aspect: [1, 1,],
       quality: 0.5,
       allowsMultipleSelection: true,
       selectionLimit: 10 - images.length,
     });

     if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImages = result.assets.map((asset) => ({
         uri: asset.uri,
         id: Math.random().toString(),
      }));

      // Merge with previously selected ones 
      setImages((prev) => [...prev, ...selectedImages]);
     }
   } catch (error: any) {
      console.log("Error picking image:", error);
      Alert.alert("Failed to pick image. Please try again.");
   }
};


  const removeImage = (id: string) => {
    setImages(images.filter((img) => img.id !== id));
  };


  const handleContinue = async () => {
    if (!category || !location || !selectedBusiness) {
      showErrorToast('Please fill in all required fields');
      return;
    }

    if (images.length < 5) {
      showErrorToast('Please upload at least 5 images');
      return;
    }

    try {
      if (!apiClient) {
        showErrorToast("API client is not initialized");
        return;
      }
      setLoading(true);

      const formData = new FormData();
      formData.append('category', category);
      formData.append('location', location);
      formData.append('link', link);

      images.forEach((image, index) => {
        const imageFile: any = {
          uri: image.uri,
          type: 'image/jpeg',
          name: `image-${index}.jpg`
        };
        formData.append('images', imageFile);
      });

      const response = await apiClient.post(`/api/carAdd/${selectedBusiness._id}`,
        formData, 
         {
           headers: {
             'Content-Type': 'multipart/form-data'
           }
        }
       );

       const carAdId = response.data.ad.adId;
       const adCategory = response.data.ad.category;

       console.log('✅  Car Ad created:', carAdId, 'Category:', adCategory);

       // Redirect based on category type 
       const vehicleCategories = ['car', 'bus', 'tricycle'];
       const isVehicle = vehicleCategories.some(
        (v) => adCategory.toLowerCase().includes(v)
       );

       if (isVehicle) {
        // Navigate to vehicle details form 
        router.push({
          pathname: '/protected/myads/vehicle-details',
          params: {
            carAdId: carAdId,
            category: adCategory
          }
        });
       } else {
        // Navigate to appropriate property form based on category 
       const categoryRoutes: Record<string, string> = {
         'Commercial Property For Rent': '/protected/myads/commercial-property-rent',
         'Commercial Property For Sale': '/protected/myads/commercial-property-sale',
         'House and Apartment Property For Rent': '/protected/myads/house-apartment-rent',
         'House and Apartment Property For Sale': '/protected/myads/house-apartment-sale',
         'Land and Plot For Rent': '/protected/myads/land-plot-rent',
         'Land and Plot For Sale': '/protected/myads/land-plot-sale',
         'Short Let Property': '/protected/myads/short-let-property',
         'Event Center And Venues': '/protected/myads/event-center-venues'
        };

        const routePath = categoryRoutes[adCategory] || '/protected/myads/property-details';

        console.log('📍 Redirecting to:', routePath);

        router.push({
          pathname: routePath as any,
          params: {
            carAdId: carAdId,
            category: adCategory
          }
        });
       }
    } catch (error: any) {
     console.error('Submit ad error:', error);
    
      if (error.response?.status === 413) {
        showErrorToast(
           'One or more images are too large. Please compress or choose smaller images before uploading.'
        );
        return;
      }

      showErrorToast(error.response?.data?.message || 'Failed to submit ad');
    } finally {
      setLoading(false);
    }
  }

    return (
      <View style={styles.container}>
        <View style={styles.header}>
            <View style={styles.headerContainer}>
               <TouchableOpacity onPress={() => router.back()}>
            <AntDesign name="arrow-left" size={24} color={colors.grey300} />
          </TouchableOpacity>
           <Text style={styles.headerTitle}>Post an Ad</Text>
            </View>
           <View style={{ width: 24 }} />
        </View>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}>
           {/* Category */}
           <Text style={styles.label}>Category</Text>
           <TouchableOpacity
             style={styles.dropdown}
             onPress={() => setCategoryModalVisible(true)}
           >
            <Text style={category ? styles.dropdownTextFilled: styles.dropdownTextPlaceholder}>
              { category || 'Select'}
            </Text>
            <AntDesign name="down" size={16} color={colors.darkGray} />
           </TouchableOpacity>

           {/* Location */}
           <Text style={styles.label}>Location</Text>
           <TouchableOpacity
             style={styles.dropdown}
             onPress={() => setLocationModalVisible(true)}
           >
             <Text style={location ? styles.dropdownTextFilled : styles.dropdownTextPlaceholder}>
               {location || 'Select Location'}
             </Text>
             <AntDesign name="down" size={16} color={colors.darkGray} />
           </TouchableOpacity>

             {/* Link */ }
           <Text style={styles.label}>Link</Text>
           <TextInput
             style={styles.input}
             placeholder="A Youtube, Facebook or any link connected to the ad"
             placeholderTextColor={colors.grey200}
             value={link}
             onChangeText={setLink}
           />

           {/* Business */ }
           <Text style={styles.label}>Select Business</Text>
           <TouchableOpacity
             style={styles.dropdown}
             onPress={() => setBusinessModalVisible(true)}
           >
            <Text style={selectedBusiness ? styles.dropdownTextFilled : styles.dropdownTextPlaceholder}>
              { selectedBusiness?.businessName || 'Select Business'}
            </Text>
            <AntDesign name="down" size={16} color={colors.darkGray} />
           </TouchableOpacity>


           {/* Add Photo */}
           <Text style={styles.label}>Add Photo</Text>
           <Text style={styles.photoHint}>
            Add at least 5 images - The first image will be the title image. Also you can drag the image to change the order
           </Text>
           <Text style={styles.photoRequirements}>
             Images must be in .png or .jpeg, image width must be at least 600px
           </Text>

           <View style={styles.imagesContainer}>
             {images.map((image) => (
               <View key={image.id} style={styles.imageWrapper}>
                <Image source={{ uri: image.uri }} style={styles.uploadedImage}  />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeImage(image.id)}
                >
                  <AntDesign name="close" size={16} color={colors.bg} />
                </TouchableOpacity>
               </View>
             ))}

             {images.length < 10 && (
              <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
                <Image 
                   source={require('../../../assets/images/add-upload.png')}
                />
              </TouchableOpacity>
             )}
           </View>

          <View style={{
            marginTop: 20,
          }}>
             <GradientButton
            title={loading ? "Loading..." : "Continue"}
            onPress={handleContinue}
            disabled={
              loading ||
              !category || 
              !location || 
              !selectedBusiness || 
              images.length < 5
            }
            disabledBgColor={colors.border}
           />
          </View>

        </ScrollView>

        {/* Modals */}
        <CategoryModal
           visible={categoryModalVisible}
           onClose={() => setCategoryModalVisible(false)}
           onSelect={setCategory}
        />

        <LocationModal
           visible={locationModalVisible}
           onClose={() => setLocationModalVisible(false)}
           onSelect={setLocation}
        />

        <BusinessModal
          visible={businessModalVisible}
          onClose={() => setBusinessModalVisible(false)}
          onSelect={setSelectedBusiness}
        />
      </View>
    );
}


const styles = StyleSheet.create({
 container: {
    flex: 1,
    backgroundColor: colors.bgTheme
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 50,
    backgroundColor: colors.bg,
    shadowColor: '#4D485F1A',
    shadowOffset: { width: 0, height: 4},
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 6,
  },
  headerContainer: {
    flexDirection: "row", 
    gap: 15,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: "WorkSans_600SemiBold",
    color: colors.darkGray,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkGray,
    fontFamily: 'WorkSans_600SemiBold',
    marginTop: 20,
    marginBottom: 8
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  dropdownTextPlaceholder: {
    fontSize: 14,
    color: colors.grey200
  },
  dropdownTextFilled: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'WorkSans_400Regular',
    color: colors.grey600
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 18,
    fontSize: 14,
    color: colors.grey600,
  },
  photoHint: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'WorkSans_400Regular',
    color: colors.lightGrey,
    marginBottom: 10,
  },
  photoRequirements: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'WorkSans_400Regular',
    color: colors.viewGray,
    marginBottom: 16
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  imageWrapper: {
    position: 'relative',
    width: 100,
    height: 100
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.red,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: colors.lightSpot,
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightWhite
  },
});
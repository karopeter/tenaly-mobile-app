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
           },
           timeout: 60000
        }
       );

       const carAdId = response.data.ad.adId;
       const adCategory = response.data.ad.category;

       console.log('✅  Car Ad created:', carAdId, 'Category:', adCategory);

       // Redirect based on category type 
      //  const vehicleCategories = [
      //   'car', 
      //   'bus',
      //   'tricycle'
      //  ];
      //  const isVehicle = vehicleCategories.some(
      //   (v) => adCategory.toLowerCase() === v.toLowerCase() || 
      //          adCategory.toLowerCase().startsWith(v.toLowerCase() + ' ')
      //  );

       const vehicleRoutes: Record<string, string> = {
         'car': '/protected/myads/vehicle-details',
         'bus': '/protected/myads/vehicle-details',
         'tricycle': '/protected/myads/vehicle-details',
      };
       if (vehicleRoutes[adCategory.toLowerCase()]) {
        const targetRoute = vehicleRoutes[adCategory.toLowerCase()];
          console.log('🚗 VEHICLE ROUTE DETECTED');
      console.log('📍 Target Route:', targetRoute);
      console.log('📦 Params:', { carAdId, category: adCategory });
      console.log('=================================');
          router.push({
             pathname: vehicleRoutes[adCategory.toLowerCase()] as any,
             params: {
               carAdId: carAdId,
               category: adCategory
            }
          });
        } else {
        // Navigate to appropriate property form based on category 
         const categoryRoutes: Record<string, string> = {
        // Property Category Routes 
         'Commercial Property For Rent': '/protected/myads/commercial-property-rent',
         'Commercial Property For Sale': '/protected/myads/commercial-property-sale',
         'House and Apartment Property For Rent': '/protected/myads/house-apartment-rent',
         'House and Apartment Property For Sale': '/protected/myads/house-apartment-sale',
         'Land and Plot For Rent': '/protected/myads/land-plot-rent',
         'Land and Plot For Sale': '/protected/myads/land-plot-sale',
         'Short Let Property': '/protected/myads/short-let-property',
         'Event Center And Venues': '/protected/myads/event-center-venues',

         // Agriculture Category routes 
         'Fresh Produce (fruits, vegetables, grains)': '/protected/myads/agriculture-product',
         'Livestock (poultry, goats, cattle, pigs, etc.)': '/protected/myads/agriculture-livestock',
         'Seeds & Seedlings': '/protected/myads/agriculture-seeds',
         'Animal Feed': '/protected/myads/agriculture-feed',
         'Fertilizers': '/protected/myads/agriculture-fertilizer',
         'Farm Tools & Equipment': '/protected/myads/agriculture-farm',
         'Agro Chemicals (pesticides, herbicides)': '/protected/myads/agriculture-agro',
         'Farm Services (plowing, irrigation, consultancy)': '/protected/myads/agriculture-service',

         // Animal & pets Category routes
           'Dogs': '/protected/myads/pets-dog',
           'Cats': '/protected/myads/pets-cat',
           'Birds': '/protected/myads/pets-bird',
           'Fish & Aquarium': '/protected/myads/pets-fish',
           'Small Pets (rabbits, hamsters, guinea pigs)': '/protected/myads/pets-hamster',
           'Pet Accessories': '/protected/myads/pets-accessorie',
           'Pet Food': '/protected/myads/pets-food',

           // Available for Hire Category Routes 
            'Hire Tech & IT': '/protected/myads/hire-tech',
            'Lessons & Trainings': '/protected/myads/hire-lessons',
            'Hire Cleaners': '/protected/myads/hire-cleaners',
            'Repair & Maintain': '/protected/myads/hire-repairs',
            'Painting & Wall Finishing': '/protected/myads/hire-painting',
            'Hire Plumbing': '/protected/myads/hire-plumbing',
            'Hire Electrical Wiring & Installation': '/protected/myads/hire-eletrical',
            'Hire Furniture Assembly': '/protected/myads/hire-furniture-assembly',
            'Hire Beauty & Wellness': '/protected/myads/hire-beautywellness',
            'Hire Creative & Media': '/protected/myads/hire-media',
            'Hire Event Planning for Hire': '/protected/myads/hire-event',
            'Hire DJ Services': '/protected/myads/hire-djservices',
            'Hire MC / Host Services': '/protected/hire-mchostservices',

            // Beauty category routes 
            'Skin Care': '/protected/myads/beauty-skin',
            'Hair Care': '/protected/myads/beauty-hair',
            'Makeup & Cosmetics': '/protected/myads/beauty-makeup',
            'Fragrances (Perfume & Body Spray)': '/protected/myads/beauty-fragrance',
            'Bath & Body': '/protected/myads/beauty-bath',
            'Nail Care': '/protected/myads/beauty-nailcare',
            'Beauty Tools & Accessories': '/protected/myads/beauty-accessorie',
            'Personal Grooming Devices': '/protected/myads/beauty-grooming',
            'Oral Care': '/protected/myads/beauty-oral',
            "Men's Grooming": '/protected/myads/beauty-men',

            // Constructions category routes 
           'Building Material': '/protected/myads/construction-material',
           'Electrical Equipment & Tools': '/protected/myads/construction-eletrical',
           'Plumbing Material & Fittings': '/protected/myads/construction-plumbing',
           'Paints & Finishes': '/protected/myads/construction-paint',
           'Hand Tools': '/protected/myads/construction-hand',
           'Safety Equipment & Workwear': '/protected/myads/construction-safety',
           'Repair & Maintenance Services': '/protected/myads/construction-repair',
           'Construction Equipment': '/protected/myads/construction-equipment',
           'Roofing Materials': '/protected/myads/construction-roofing',
           'Flooring & Tiles': '/protected/myads/construction-flooring',

           // Equipment category routes 
           'Industrial Machines': '/protected/myads/equipment-machine',
           'Construction Equipments': '/protected/myads/equipment-construction',
           'Power Tools': '/protected/myads/equipment-tool',
           'Manufacturing Equipment': '/protected/myads/equipment-manufacturing',
           'Medical & Laboratory Equipment': '/protected/myads/equipment-medical',
           'Kitchen & Restaurant Equipment': '/protected/myads/equipment-kitchen',
           'Printing & Packaging Machines': '/protected/myads/equipment-printing',
           'Agricultural Machinery': '/protected/myads/equipment-agriculture',
           'Cleaning & Laundry Equipment': '/protected/myads/equipment-cleaning',
           'Office Equipment': '/protected/myads/equipment-office',

           // Kids category routes 
            'Baby Clothes': '/protected/myads/kids-baby-clothes',
            'Kids Clothes': '/protected/myads/kids-clothes',
            'Shoes': '/protected/myads/kids-shoes',
            'Toys & Games': '/protected/myads/kids-toy',
            'Baby Gear (strollers, car seats, carriers)': '/protected/myads/kids-gear',
            'Feeding (bottles, high chairs, breast pumps)': '/protected/myads/kids-feeding',
            'Furniture (cribs, cots, wardrobes)': '/protected/myads/kids-furnitures',
            'Health & Safety (monitors, baby gates)': '/protected/myads/kids-health',
            'School Supplies (bags, books, stationery)': '/protected/myads/kids-school',

            // Fashion category routes 
            'Clothing': '/protected/myads/fashion-clothing',
            'Footwear': '/protected/myads/fashion-footwear',
            'Bags': '/protected/myads/fashion-bags',
            'Jewellery': '/protected/myads/fashion-jewellery',
            'Watches': '/protected/myads/fashion-watch',
            'Accessories': '/protected/myads/fashion-accessories',
            'Eyewear (Glasses & Sunglasses)': '/protected/myads/fashion-eyewear',
            'Wedding & Event Wear': '/protected/myads/fashion-wedding',

            // Gadget category routes 
            'Mobile Phones': '/protected/myads/gadget-phones',
            'Tablets': '/protected/myads/gadget-tablets',
            'Smartwatches': '/protected/myads/gadget-smartwatches',
            'Phone Accessories': '/protected/myads/gadget-accessories',
            'Tablet Accessories': '/protected/myads/gadget-tabac',
            'Power Banks': '/protected/myads/gadget-powerbank',
            'Chargers & Cables': '/protected/myads/gadget-chargers',
            'Screen Protectors': '/protected/myads/gadget-screen',
            'Pouch': '/protected/myads/gadget-pouch',
            'Covers': '/protected/myads/gadget-cover',
            'Earphones / Headsets': '/protected/myads/gadget-earphone',
            

            // Household category routes 
            'Furniture': '/protected/myads/household-furniture',
            'Home Appliances': '/protected/myads/household-appliance',
            'Kitchen Appliances': '/protected/myads/household-kitchen',
            'Home Decor': '/protected/myads/household-homedecor',
            'Lighting': '/protected/myads/household-lighting',
            'Bedding & Linen': '/protected/myads/household-bedding',
            'Curtains & Blinds': '/protected/myads/household-curtain',
            'Kitchenware & Cookware': '/protected/myads/household-kitchenware',
            'Cleaning Equipment': '/protected/myads/household-cleaning',
            'Bathroom Accessories': '/protected/myads/household-bathroom',
            'Garden & Outdoor': '/protected/myads/household-garden',
            'Others': '/protected/myads/household-other',

            // JobNewServives category routes 
            'Tech & IT': '/protected/myads/jobs-tech',
            'Lessons & Training': '/protected/myads/jobs-lessons',
            'Cleaning': '/protected/myads/jobs-cleaning',
            'Repairs & Maintenance': '/protected/myads/jobs-repair-maintenance',
            'Painting & Well Finishing': '/protected/myads/jobs-painting',
            'Plumbing': '/protected/myads/jobs-plumbing',
            'Electrical Wiring & Installation': '/protected/myads/jobs-eletrical',
            'Furniture Assembly': '/protected/myads/jobs-furniture',
            'Beauty & Wellness': '/protected/myads/jobs-beauty',
            'Creative & Media': '/protected/myads/jobs-creative',
            'Event Planning & Coordination': '/protected/myads/jobs-event-planning',
            'Dj Services': '/protected/myads/jobs-dj-services',
            'MC / Host Services': '/protected/myads/jobs-mc-services',

            // Laptops and computers category routes 
            'Laptops': '/protected/myads/laptops-details',
            'Desktop Computers': '/protected/myads/laptops-desktop',
            'Computer Accessories': '/protected/myads/computer-accessories',
            'Monitors': '/protected/myads/laptops-monitor',
            'Printers & Scanners': '/protected/myads/laptops-printer',
            'Networking Equipment': '/protected/myads/laptops-networking',
            'Storage Devices': '/protected/myads/laptops-storage',
            'Software': '/protected/myads/laptops-software',
            'Others': '/protected/myads/laptops-others',
        };

        const routePath = categoryRoutes[adCategory] || '/protected/myads/property-details';

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
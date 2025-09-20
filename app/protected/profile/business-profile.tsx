import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/app/constants/theme';
import { useRouter } from 'expo-router';
import { showErrorToast } from '@/app/utils/toast';
import apiClient from '@/app/utils/apiClient';

interface Business {
  _id: string;
  businessName: string;
 aboutBusiness: string;
 location: string;
 addresses: Address[];
 created: string;
}

interface Address {
  _id: string;
  address: string;
  deliveryAvailable: boolean;
}

interface BusinessProfileProps {
  onNavigateToAddBusiness: () => void;
}

type TabType = 'details' | 'hours' | 'delivery';


export default function BusinessProfile({ onNavigateToAddBusiness }: BusinessProfileProps) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const router = useRouter();


  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
     try {
       if (!apiClient) {
        showErrorToast('API client not initialized.');
        return;
      }
      setLoading(true);
      const response = await apiClient.get('/api/business/my-businesses');
      setBusinesses(response.data || []);
     } catch (error: any) {
      console.error('Error fetching businesses:', error);
      showErrorToast(error?.response?.data?.message || 'Failed to fetch businesses');
      setBusinesses([]);
     } finally {
      setLoading(false);
     }
  }

  const handleTabPress = (tab: TabType) => {
    setActiveTab(tab);

    // Navigate to different screens based on tab 
    switch (tab) {
      case 'details': 
      // Stay on current screen 
      break;
     case 'hours':
       router.push('/protected/profile/BusinessHours');
       break;
     case 'delivery': 
       router.push('/protected/profile/BusinessDelivery');
      break;
     default: 
       break;
    }
  };

  const TabButton = ({ tab, title}: { tab: TabType; title: string}) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === tab && styles.activeTabButton 
      ]}
      onPress={() => handleTabPress(tab)}
    >
      <Text style={[
         styles.tabText,
         activeTab === tab && styles.activeTabText
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const BusinessList = () => (
    <ScrollView 
      showsVerticalScrollIndicator={false} 
      style={styles.businessListContainer}>
          <TouchableOpacity
       style={styles.addAddressButton}
       onPress={() => router.push('/protected/profile/AddBusiness')}
     >
       <View style={styles.addAddressIconContainer}>
         <Text style={styles.addAddressIcon}>+</Text>
       </View>
       <Text style={styles.addAnotherText}>Add another business</Text>
     </TouchableOpacity>
     {businesses.map((business, index) => (
       <View key={business._id} style={styles.businessCard}>
           <View style={styles.businessHeader}>
              <Text style={styles.businessTitle}>Business {index + 1}</Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => router.push(`/protected/profile/EditBusiness/${business._id}` as any)}
              >
                <Image 
                   source={require('../../../assets/images/editIcon.png')}
                   style={styles.editIcon}
                />
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
           </View>

           <View style={styles.businessInfo}>
            <View style={styles.businessNameRow}>
              <Image 
               source={require('../../../assets/images/brifecase-tick.png')}
               style={styles.businessIcon}
              />
              <Text style={styles.businessName}>{business.businessName}</Text>
            </View>

            <Text style={styles.businessDescription}>{business.aboutBusiness}</Text>

            {business.addresses.map((address, addressIndex) => (
              <View key={address._id} style={styles.addressContainer}>
                <Text style={styles.addressNumText}>Address {addressIndex + 1}</Text>
                <View style={styles.addressRow}>
                   <Image 
                     source={require('../../../assets/images/location.png')}
                     style={styles.locationIcon}
                   />
                   <View style={styles.addressDetails}>
                    <Text style={styles.locationText}>{business.location}</Text>
                    <Text style={styles.addressText}>{address.address}</Text>
                  </View>
                </View>
              </View>
            ))}
           </View>
       </View>
     ))}
    </ScrollView>
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.imageContainer}>
        <View>
           <View style={styles.personIcon}>
             <Image 
              source={require('../../../assets/images/emptyBusiness.png')}
             />
           </View>

           <Text style={styles.emptyTitle}>No Business added yet</Text>

           <TouchableOpacity 
              onPress={() => router.push('/protected/profile/AddBusiness')}
              >
               <LinearGradient
                colors={['#00A8DF', '#1031AA']}
                 start={{ x: 0, y: 0 }}
                 end={{ x: 1, y: 0 }}
                style={styles.addButton}>
               <View style={styles.buttonContent}>
                 <Text style={styles.plusIcon}>+</Text>
                <Text style={styles.buttonText}>Add a business</Text>
               </View>
            </LinearGradient>
           </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderTabContent = () => {
     switch (activeTab) {
      case 'details':
         return loading ? (
           <View style={styles.loadContainer}>
             <ActivityIndicator size="large" color={colors.blue} />
             <Text style={styles.loadingText}>Loading businesses...</Text>
           </View>
         ): businesses.length === 0 ? (
          <EmptyState />
         ): (
           <BusinessList />
         );
         case 'hours': 
         return (
          <View style={styles.tabContentContainer}>
            <Text style={styles.tabContentText}>Business Hours Content</Text>
          </View>
         );
         case 'delivery':
          return (
            <View style={styles.tabContentContainer}>
               <Text style={styles.tabContentText}>Delivery Content</Text>
            </View>
          );
          default: 
          return null;
     }
  };

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />

        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.push('/protected/profile')}
             style={styles.backButton}>
                 <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.detailsText}>Business Details</Text>
        </View>

       {/* Tab Navigation */ }
       <View style={styles.tabContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabScrollContainer}
          >
            <TabButton tab="details" title="Business details" />
            <TabButton tab="hours" title="Business hours" />
            <TabButton tab="delivery" title="Delivery" />
          </ScrollView>
       </View>

        {/* Tab Content */ }
        <View style={styles.content}>
          {renderTabContent()}
        </View>
      </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgTheme
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: colors.bg,
    shadowColor: colors.blurGrey,
     paddingTop: 30,
    paddingBottom: 20,
    shadowOffset: { width: 0, height: 4, },
    shadowOpacity: 0.1,
    elevation: 6,
  },
  backButton: {
    marginRight: 15,
  },
  detailsText: {
    color: colors.lightGrey, 
    fontWeight: '600',
    fontSize: 16,
  },
  tabContainer: {
  },
  tabScrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginRight: 16,
    borderRadius: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.mdLight
  },

  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 1,
    borderRadius: 4,
    backgroundColor: 'transparent',
  },
  activeTabButton: {
    backgroundColor: colors.blue
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.darkGray
  },
  activeTabText: {
     color: colors.bg,
     fontWeight: '600'
  },
  backIcon: {
    fontSize: 24,
    color: colors.grey300
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.blackGrey
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tabContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  tabContentText: {
    fontSize: 16,
    color: colors.lightGrey,
    fontWeight: '500'
  },
  loadContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.lightGray,
    fontWeight: '500'
  },
  businessListContainer: {
    flex: 1,
    paddingTop: 20,
  },
  businessCard: {
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.blurGrey,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 3,
  },
  businessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  businessTitle: {
   fontSize: 14,
   fontWeight: '500',
   color: colors.blue
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
    paddingVertical: 6,
  },
  editIcon: {
   width: 16,
   height: 16
  },
  editText: {
     fontSize: 14,
     color: colors.viewGray,
     fontWeight: '500'
  },
  businessInfo: {
     gap: 12,
  },
  businessNameRow: {
   flexDirection: 'row',
   alignItems: 'center'
  },
  businessIcon: {
      width: 20,
      height: 20,
      marginRight: 10,
  }, 
  businessName: {
     fontSize: 18,
     fontWeight: '500',
     color: colors.darkGray,
  },
  businessDescription: {
   fontSize: 14,
   color: colors.lightGrey,
   fontWeight: '400',
   lineHeight: 20,
  },
  addressContainer: {
    marginTop: 8,
  },
  addressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.lightGrey,
    marginBottom: 8,
  },
  addressNumText: {
   color: colors.darkGray,
   fontWeight: '500',
   fontSize: 14,
   marginBottom: 10,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  locationIcon: {
    marginRight: 8,
    marginTop: 12,
  },
  addressDetails: {
   flex: 1,
  },
  locationText: {
     fontSize: 14,
     fontWeight: '500',
     color: colors.darkGray
  },
  addressText: {
     fontSize: 14,
     color: colors.lightGrey,
     opacity: 0.7,
     marginTop: 2,
  },
  addAddressButton: {
     flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderStyle: 'dashed',
    marginBottom: 20,
    gap: 5,
  },
  addAddressIconContainer: {
   marginRight: 12,
  },
   addAddressIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.blue,
    width: 24,
    borderWidth: 1.5,
    borderColor: colors.blue,
    height: 24,
    textAlign: 'center',
    borderRadius: 12,
  },
  addAnotherText: {
    fontSize: 16,
    color: colors.blue,
    fontWeight: '600',
    textAlign: 'left'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  imageContainer: {
    marginBottom: 30,
  },
  personIcon: {
    alignItems: 'center'
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.lightGrey,
    marginTop: 20,
    textAlign: 'center'
  },
  addButton: {
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginTop: 30,
    width: 262,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.bg,
    marginRight: 8,
   // backgroundColor: 'rgba(255,255,255,0.3)',
    width: 24,
    height: 24,
    textAlign: 'center',
    lineHeight: 20,
    borderWidth: 1.5,
    borderColor: colors.bg,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.bg,
  }
});
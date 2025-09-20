import React, { useState, useEffect } from 'react';
import {
  View, 
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/app/constants/theme';
import { useRouter } from 'expo-router';
import apiClient from '@/app/utils/apiClient';
import { showErrorToast, showSuccessToast } from '@/app/utils/toast';

interface BusinessData  {
  _id: string;
  businessName: string;
  aboutBusiness?: string;
  location?: string;
  addresses: {
    _id: string;
    address: string;
    deliveryAvailable?: boolean;
    deliverySettings?: {
        explanation?: string;
        dayFrom?: number;
        daysTo?: number;
        chargeDelivery?: string;
        feeFrom?: number;
        feeTo?: number;
    };
  }[];
  businessHours: {
    _id: string;
    address: string;
    openingTime: string;
    closingTime: string;
    days: string[];
  }[];
  createdAt?: string;
};


type TabType = 'details' | 'hours' | 'delivery';


const formatDays = (days: string[]) => {
  const dayMap: Record<string, string> = {
   Monday: "Mon",
   Tuesday: "Tue",
   Wednesday: "Wed",
   Thursday: "Thu",
   Friday: "Fri",
   Saturday: "Sat",
   Sunday: "Sun" 
  };

  return days.map((day) => dayMap[day] || day);
};



export default function BusinessHours() {
   //const [businessHour, setBusinessHour] = useState<BusinessHours[]>([]);
   const [businesses, setBusinesses] = useState<BusinessData[]>([]);
   const [selectedBusiness, setSelectedBusiness] = useState<BusinessData | null>(null);
   const [showWorkingHourModal, setShowWorkingHourModal] = useState(false);
     const [activeTab, setActiveTab] = useState<TabType>('hours');
     const [loading, setLoading] = useState(false);
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

     const handleAddBusinessHour = (business: BusinessData) => {
        if (businesses.length > 1) {
           setSelectedBusiness(business);
           setShowWorkingHourModal(true);
        } else {
         router.push(`/protected/profile/AddBusinessHours/${business._id}` as any);
        }    
     }

    const handleWorkingHourChoice = (sameHours: boolean) => {
        setShowWorkingHourModal(false);
        if (sameHours) {
         router.push(`/protected/profile/AddBusinessHours/${selectedBusiness?._id}` as any);
        } else {
          router.push(`/protected/profile/AddBusinessHours/${selectedBusiness?._id}` as any);
        }
        setSelectedBusiness(null);
    };

    const handleEditBusinessHours = (business: BusinessData) => {
           router.push(`/protected/profile/EditBusinessHours/${business._id}` as any);
    }

    const createBusinessHours = async (businessId: string, hoursData: any[]) => {
        try {
         if (!apiClient) {
           showErrorToast("API client is not initialized");
           return;
         }
         const response = await apiClient.put(`/api/business/${businessId}/hours`, {
            businessHours: hoursData
         });

         showSuccessToast('Business hours created successfully!');
         await fetchBusinesses();
         return response.data;
        } catch (error: any) {
          console.error('Error creating business hours', error);

         let errorMessage = 'Failed to create business hours';
          if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
         } else if (error.response?.status === 400) {
           errorMessage = 'Please provide valid business hours';
         } else if (error.response?.status === 404) {
          errorMessage = 'Business not found';
         } 

         showErrorToast(errorMessage);
         throw error;
       }
    };


    const updateBusinessHours = async (businessId: string, hoursData: any[]) => {
      try {
        if (!apiClient) {
           showErrorToast("API Client is not initialized");
           return;
        }
        const response = await apiClient.put(`/api/business/${businessId}/hours`, {
          businessHours: hoursData
        });

        showSuccessToast('Business hours updated successfully!');
        await fetchBusinesses();
        return response.data;
      } catch (error: any) {
        console.error('Error updating business hours:', error);

         let errorMessage = 'Failed to update business hours';
          if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }

        showErrorToast(errorMessage);
        throw error;
      }
    };


const BusinessWithHours = ({ business }: { business: BusinessData }) => {
  return (
    <View style={styles.businessCard}>
      {/* Header */}
      <View style={styles.businessHeader}>
        <Text style={styles.businessName}>{business.businessName}</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEditBusinessHours(business)}
        >
          <Image
            source={require("../../../assets/images/editIcon.png")}
            style={styles.editIcon}
          />
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* All working hours grouped under same card */}
      <View style={styles.hoursList}>
        {business.businessHours.map((hours, index) => {
          let addressText = "Address not found";

          try {
            const addressMatch = hours.address?.match(/address: '([^']+)'/);
            if (addressMatch) {
              addressText = addressMatch[1];
            } else if (business.addresses?.[index]) {
              addressText = business.addresses[index].address;
            }
          } catch (error) {
            console.log("Error parsing address:", error);
            if (business.addresses?.[index]) {
              addressText = business.addresses[index].address;
            }
          }

          return (
            <View key={hours._id}>
              {/* Address */}
              <View style={styles.hourContainer}>
                 <View style={styles.addressRow}>
                <Image
                  source={require("../../../assets/images/location.png")}
                  style={styles.locationIcon}
                />
                  <Text style={styles.addressText}>{addressText}</Text>
              </View>

               <View style={styles.timeContainer}>
                  <Image
                    source={require("../../../assets/images/clock2.png")}
                    style={styles.timeIcon}
                  />
                  <Text style={styles.timeText}>
                    {hours.openingTime} - {hours.closingTime}
                  </Text>
                </View>
              </View>
              <View style={styles.daysContainer}>
                {formatDays(hours.days).map((day) => (
                  <View key={day} style={styles.dayPill}>
                     <Text style={styles.dayText}>{day}</Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};


const BusinessWithoutHours = ({ business }: { business: BusinessData }) => (
    <View style={styles.businessCard}>
      <View style={styles.hourCreate}>
        <Text style={styles.businessName}>{business.businessName}</Text>
      <TouchableOpacity 
        style={styles.addHourButton}
        onPress={() => handleAddBusinessHour(business)}
      >
        <Image 
          source={require('../../../assets/images/add-circle2.png')} 
          style={styles.addIcon}
        />
        <Text style={styles.addHourText}>Add business hour</Text>
      </TouchableOpacity>
      </View>
    </View>
  );

  const WorkingHourModal = () => (
    <Modal
      visible={showWorkingHourModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowWorkingHourModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setShowWorkingHourModal(false)}
          >
            <Text style={styles.closeIcon}>×</Text>
          </TouchableOpacity>

          <View style={styles.modalIcon}>
            <Image 
              source={require('../../../assets/images/timer.png')} 
              style={styles.modalIconImage}
            />
          </View>

          <Text style={styles.modalTitle}>Working hour selection</Text>
          <Text style={styles.modalSubtitle}>
            Will the address 1 and address 2 of {selectedBusiness?.businessName} have the same working hour?
          </Text>

          <TouchableOpacity
            onPress={() => handleWorkingHourChoice(true)}>
              <LinearGradient
                  colors={['#00A8DF', '#1031AA']}
                   start={{ x: 0, y: 0 }}
                   end={{ x: 1, y: 0 }}
                  style={styles.modalPrimaryButton}>
                  <Text style={styles.modalPrimaryText}>Yes, they have the same business hours</Text>
              </LinearGradient>
             </TouchableOpacity>


          <TouchableOpacity
            style={styles.modalSecondaryButton}
            onPress={() => handleWorkingHourChoice(false)}
          >
            <Text style={styles.modalSecondaryText}>No, they will be different</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
 

      const handleTabPress = (tab: TabType) => {
       setActiveTab(tab);
    
    // Navigate to different screens based on tab
    switch (tab) {
      case 'details':
        router.push('/protected/profile/business-profile');
        break;
      case 'hours':
        // Stay on current screen
        break;
      case 'delivery':
        router.push('/protected/profile/BusinessDelivery');
        break;
      default:
        break;
    }
  };

   const TabButton = ({ tab, title }: { tab: TabType; title: string }) => (
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

    const EmptyState = () => (
      <View style={styles.emptyContainer}>
        <View style={styles.imageContainer}>
          <View>
             <View style={styles.personIcon}>
               <Image 
                source={require('../../../assets/images/emptyBusiness.png')}
               />
             </View>
  
             <Text style={styles.emptyTitle}>
                You can`t add business hours because {"\n"}
                you haven`t  added a business yet
             </Text>
  
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
    case "details":
      return (
        <View style={styles.tabContentContainer}>
          <Text style={styles.tabContentText}>Business Details</Text>
        </View>
      );

    case "hours":
      if (loading) {
        return (
          <View style={styles.loadContainer}>
            <ActivityIndicator size="large" color={colors.blue} />
            <Text style={styles.loadingText}>Loading business hour...</Text>
          </View>
        );
      }

      if (!businesses || businesses.length === 0) {
        return <EmptyState />;
      }

      return (
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
            {businesses.map((business) =>
              business.businessHours && business.businessHours.length > 0 ? (
                <BusinessWithHours key={business._id} business={business} />
              ) : (
                <BusinessWithoutHours key={business._id} business={business} />
              )
            )}
          </ScrollView>

          {/* Keep modal here so it's tied to Hours tab */}
          <WorkingHourModal />
        </View>
      );

    case "delivery":
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
             style={styles.backButton}
           >
              <Text style={styles.backIcon}>←</Text>
           </TouchableOpacity>
           <Text style={styles.detailsText}>Business Profile</Text>
        </View>

         {/* Tab Navigation */}
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
  },
  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 1,
    borderRadius: 4,
    backgroundColor: 'transparent',
  },
  activeTabButton: {
    backgroundColor: '#000087',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
    paddingHorizontal: 20,
  },
  imageContainer: {
    marginBottom: 30,
  },
  personIcon: {
    alignItems: 'center'
  },
  emptyTitle: {
    fontSize: 14,
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
    borderWidth: 1,
    borderColor: '#EDEDED',
    alignSelf: 'flex-start'
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
  },
  businessCard: {
   borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    borderWidth: 1,
    marginVertical: 10,
    marginHorizontal: 16,
    borderColor: colors.border,
    shadowColor: colors.blurGrey,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 3,
  },
  hourCreate: {
   flexDirection: 'row', 
   justifyContent: 'space-between',
   alignItems: 'center',
   marginBottom: 10,
  },
  businessHeader: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   alignItems: 'center',
   paddingHorizontal: 8,
   //paddingVertical: 6,
  },
  businessName: {
    color: colors.darkGray,
    fontSize: 14,
    fontWeight: '500'
  },
  addHourButton: {
   flexDirection: 'row',
   alignItems: 'center',
   gap: 5,
   backgroundColor: '#EDEDED',
   minHeight: 40,
   minWidth: 100,
   borderRadius: 4,
   paddingHorizontal: 12,
  },
  addIcon: {
    width: 16,
    height: 16,
  },
  addHourText: {
    color: colors.viewGray,
    fontSize: 14,
    fontWeight: '400',
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
    height: 16,
  },
  editText: {
    color: colors.viewGray,
    fontSize: 14,
    fontWeight: '500'
  },
  hoursList:{
   padding: 15,
  },
  hourContainer: {
    //flexDirection: 'column', 
    flexDirection: 'row',
    gap: 4, 
    marginBottom: 8,
    justifyContent: 'space-between'
  },
  addressRow: {
    flexDirection: 'row',
   // flexWrap: 'wrap',
    flexShrink: 1,
  },
  locationIcon: {
    marginRight: 8,
    marginTop: 4,
  },
   addressText: {
     fontSize: 14,
     color: colors.lightGrey,
     opacity: 0.7,
     marginTop: 2,
     flexShrink: 1,
     flexWrap: 'wrap'
  },
  timeContainer: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
    //marginBottom: 14,
  },
  timeIcon: {
   width: 16,
   height: 16,
  },
   contentTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.lightGrey,
    marginBottom: 8,
  },
  contentSubtitle: {
    fontSize: 16,
    color: colors.lightGrey,
    opacity: 0.7,
    marginBottom: 30,
  },
  hoursContent: {
    flex: 1,
  },
  placeholderText: {
    fontSize: 16,
    color: colors.lightGrey,
    opacity: 0.6,
    textAlign: 'center',
    marginBottom: 30,
  },
  dayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.bg,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: colors.blurGrey,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 2,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.blue,
  },
  timeText: {
    fontSize: 14,
    color: colors.lightGreenShade,
    opacity: 0.8,
  },
  daysContainer: {
    marginTop: 5,
    flexDirection: 'row',
    marginBottom: 10,
    flexWrap: 'wrap',
    gap: 6,
  },
  dayPill: {
   backgroundColor: colors.blueGrey,
  paddingVertical: 4,
  paddingHorizontal: 10,
  borderRadius: 8,
  marginRight: 6,
  marginBottom: 6,
  },
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.4)', 
  justifyContent: 'flex-end',
},

modalContent: {
  backgroundColor: colors.bg, 
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  padding: 20,
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: -2 },
  shadowOpacity: 0.1,
  shadowRadius: 6,
  elevation: 10,
},

closeButton: {
  position: 'absolute',
  top: 12,
  right: 12,
  zIndex: 10,
  backgroundColor: '#f2f2f2',
  borderRadius: 16,
  width: 28,
  height: 28,
  justifyContent: 'center',
  alignItems: 'center',
},

closeIcon: {
  fontSize: 20,
  fontWeight: '600',
  color: colors.lightGrey,
  textAlign: 'center',
},

modalIcon: {
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: '#EEF3FF',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 16,
  marginTop: 16,
},

modalIconImage: {
  width: 32,
  height: 32,
  resizeMode: 'contain',
},

modalTitle: {
  fontSize: 18,
  fontWeight: '500',
  color: colors.darkGray,
  textAlign: 'center',
  marginBottom: 8,
},

modalSubtitle: {
  fontSize: 14,
  color: colors.viewGray,
  textAlign: 'center',
  marginBottom: 24,
  fontWeight: '400',
  paddingHorizontal: 10,
},

modalPrimaryButton: {
  borderRadius: 12,
  paddingVertical: 14,
  paddingHorizontal: 20,
  width: '100%',
  alignItems: 'center',
  marginBottom: 12,
},

modalPrimaryText: {
  color: colors.bg,
  fontSize: 15,
  fontWeight: '600',
  textAlign: 'center',
},

modalSecondaryButton: {
  backgroundColor: '#fff',
  borderRadius: 12,
  paddingVertical: 14,
  paddingHorizontal: 20,
  width: '100%',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#E0E0E0',
},

modalSecondaryText: {
  color: colors.lightGrey,
  fontSize: 15,
  fontWeight: '600',
  textAlign: 'center',
},

});
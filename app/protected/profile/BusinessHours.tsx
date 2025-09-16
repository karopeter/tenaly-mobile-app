import React, { useState} from 'react';
import {
  View, 
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/app/constants/theme';
import { useRouter } from 'expo-router';

interface BusinessHours {
    id: string;
    name: string;
    addresses: Address[];
    openingTime: string;
    closingTime: string;
    daysOfWeek: string;
    createdAt: string;
}

interface Address {
  id: string;
  location: string;
  address: string;
}


type TabType = 'details' | 'hours' | 'delivery';




export default function BusinessHours() {
    const [businessHour, setBusinessHour] = useState<BusinessHours[]>([]);
     const [activeTab, setActiveTab] = useState<TabType>('hours');
     const [loading, setLoading] = useState(false);
     const router = useRouter();
 

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
          case 'details':
           return (
             <View style={styles.tabContentContainer}>
               <Text style={styles.tabContentText}>Business Details</Text>
             </View> 
           );
        case 'hours': 
        return loading ? (
            <View style={styles.loadContainer}>
              {/* Add loading spinner here if needed */ }
            </View>
          ): businessHour.length === 0 ? (
            <EmptyState />
          ): (
            <View>
                {/* Business Hour list will go here when implemented */}
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
    backgroundColor: colors.setGrey
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
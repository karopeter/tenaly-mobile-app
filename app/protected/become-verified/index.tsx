import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '@/app/constants/theme';
import { useAuth } from '@/app/context/AuthContext';
import { showErrorToast, showSuccessToast } from '@/app/utils/toast';

import VerificationList from '@/app/components/VerificationList';
import PersonalVerificationForm from '@/app/components/PersonalVerificationForm';
import BusinessVerificationForm from '@/app/components/BusinessVerificationForm';
import VerificationStatusScreen from '@/app/components/VerificationStatusScreen';

import { VerificationService } from '@/app/services/verificationService';
import { UserProfile, VerificationStatus, Business, DocumentFile  } from '../home';

type ViewType = 'main' | 'personal' | 'business' | 'status';


const BecomeVerified: React.FC = () => {
   const router = useRouter();
   const { user } = useAuth();

   const [view, setView] = useState<ViewType>('main');
   const [loading, setLoading] = useState(true);
   const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
   const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
   const [userBusinesses, setUserBusinesses] = useState<Business[]>([]);
   const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);

   useEffect(() => {
     fetchData();
   }, []);

   const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch use profile 
      const profileResponse = await VerificationService.getVerificationStatus();
      setVerificationStatus(profileResponse);

      // Fetch user businesses 
      try {
        const businessResponse = await VerificationService.getUserBusinesses();
        setUserBusinesses(businessResponse);
      } catch (error) {
         console.log('No businesses found or error:', error);
         setUserBusinesses([]);
      }

      // Check verification status 
      if (user?.isVerified) {
        setView('status');
      } else if (user?.hasSubmittedVerification) {
        setView('status');
      }
    } catch (error: any) {
     console.error('Error fetching data:', error);
     showErrorToast('Failed to load verification data');
    } finally {
      setLoading(false);
    }
   };

   const handleSelectPersonal = () => {
     setView('personal');
   };

   const handleSelectBusiness = (businessId: string) => {
    setSelectedBusinessId(businessId);
    setView('business');
   };

   const handlePersonalSubmit = async (validIdType: string, validIdFile: DocumentFile) => {
     try {
      const formData = new FormData();
      formData.append('validIdType', validIdType);
      formData.append('validId', {
        uri: validIdFile.uri,
        name: validIdFile.name,
        type: validIdFile.type,
      } as any);

      await VerificationService.submitPersonalVerification(formData);
      showSuccessToast('Personal verification submitted successfully!');

        // Refresh data
      await fetchData();
      setView('main');
     } catch (error: any) {
       console.error('Personal verification error:', error);
       const message = error.response?.data?.message || 'Failed to submit verification';
        showErrorToast(message);
        throw error;
     }
   };

   const handleBusinessSubmit = async (
     businessId: string,
     address: string,
     email: string,
     phone: string,
     certificate: DocumentFile
   ) => {
     try {
    const formData = new FormData();
      formData.append('businessId', businessId);
      formData.append('businessAddress', address);
      formData.append('businessEmail', email);
      formData.append('businessPhoneNumber', phone);
      formData.append('certificate', {
        uri: certificate.uri,
        name: certificate.name,
        type: certificate.type,
      } as any);

      await VerificationService.submitBusinessVerification(formData);
      showSuccessToast('Business verification submitted successfully!');

      // Refresh data 
      await fetchData();
      setView('main');
     } catch (error: any) {
       console.error('Business verification error:', error);
       const message = error.response?.data?.message || 'Failed to submit verification';
       showErrorToast(message);
       throw error;
     }
   };

   const handleBack = () => {
    if (view === 'main') {
      router.back();
    } else {
      setView('main');
      setSelectedBusinessId(null);
    }
   };

   const handleDone = () => {
    router.back();
   };


    // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1031AA" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }


   const selectedBusiness = userBusinesses.find((b) => b._id === selectedBusinessId);

   
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <AntDesign name="arrow-left" size={20} color={colors.darkGray} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {view === 'personal'
            ? 'Verify your personal identity'
            : view === 'business'
            ? `Verify ${selectedBusiness?.businessName}`
            : 'Become a verified seller'}
        </Text>
      </View>

      {/* Content */}
      {view === 'status' ? (
        <VerificationStatusScreen
          isVerified={user?.isVerified || false}
          onDone={handleDone}
        />
      ) : view === 'main' ? (
        <VerificationList
          personalVerification={verificationStatus?.personal || null}
          businessVerifications={verificationStatus?.businesses || []}
          userBusinesses={userBusinesses}
          onSelectPersonal={handleSelectPersonal}
          onSelectBusiness={handleSelectBusiness}
        />
      ) : view === 'personal' ? (
        <PersonalVerificationForm
          onSubmit={handlePersonalSubmit}
          onBack={handleBack}
        />
      ) : view === 'business' && selectedBusiness ? (
        <BusinessVerificationForm
          selectedBusiness={selectedBusiness}
          onSubmit={handleBusinessSubmit}
          onBack={handleBack}
        />
      ) : null}
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgTheme,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.lightGray,
    fontWeight: '500',
    fontFamily: 'WorkSans_500Medium',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: colors.bg,
    shadowColor: colors.blurGrey,
    paddingTop: 30,
    paddingBottom: 20,
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
    flex: 1,
  },
});

export default BecomeVerified;
import React, { useState, useEffect  } from 'react';
import { 
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Dimensions,
  BackHandler,
  Alert
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Input from '../components/Input';
import GradientButton from '../components/GradientButton/GradientButton';
import { Dropdown } from '../components/Dropdown/dropdown';
import { useAuth } from '../context/AuthContext';
import { showErrorToast, showSuccessToast } from '../utils/toast';
import { colors } from '../constants/theme';
import { useRouter } from 'expo-router';


const { width } = Dimensions.get('window');

const completeProfileSchema = Yup.object().shape({
  roleSelection: Yup.string().required('Please select your user type'),
  phoneNumber: Yup.string()
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 'Invalid phone number')
    .required('Phone number is required'),
});

const CompleteProfile: React.FC = () => {
   const { completeProfile, user, signOut } = useAuth();
   const [loading, setLoading] = useState(false);
   const router = useRouter();


   const roleOptions = [
     { label: 'I am Buying', value: 'customer' },
    { label: 'I am Selling', value: 'seller' },
   ];


   // Prevent back navigation - user must complete profile 
   useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        Alert.alert(
        'Complete Your Profile',
        'Please complete your profile to continue using Tenaly.',
        [
          {
            text: 'Sign Out',
            onPress: () => signOut(),
            style: 'destructive',
          },
          {
            text: 'Continue',
            style: 'cancel',
          },
        ]
      );
      return true; // Prevent default back behavior 
    });

    return () => backHandler.remove();
   }, []);


   const handleCompleteProfile = async (values: any) => {
     setLoading(true);
     try {
       await completeProfile(values.roleSelection, values.phoneNumber);
       showSuccessToast('Profile completed successfully! 🎉');
       // Navigation is handled i  completeProfile functions 
     } catch (error: any) {
       showErrorToast(error.message || 'Failed to complete profile');
     } finally {
       setLoading(false);
     }
   };

    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-[#F8F8F8]"
      >
        {/* Logo */}
        <View className="items-center mt-">
         <View 
          style={{
            width: Math.min(106, width * 0.8),
            height: Math.min(52, width * 0.4)
          }}
         >
          <Image 
             source={require('../../assets/images/tenaly-logo.png')}
             style={{
              width: '100%',
              height: '100%',
              resizeMode: 'contain'
             }}
          />
         </View>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
          <Formik
            initialValues={{
             roleSelection: '',
             phoneNumber: '',
            }}
            validationSchema={completeProfileSchema}
            onSubmit={handleCompleteProfile}
          >
           {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
            setFieldValue,
           }) => (
            <View 
              className="bg-white rounded-lg px-4 pt-6 pb-8 mx-auto mt-6"
              style={{
                width: '90%',
                maxWidth: 400,
                borderRadius: 24,
              }}
            >
             <Text style={styles.title}>Complete your profile</Text>  
             <Text style={styles.subtitle}>
                Welcome {user?.fullName || "User"}! Please provide additional information to get started.
             </Text>

              {/* User Type Dropdown */}
              <View className="mb-4">
                <Dropdown 
                  label="User type"
                  options={roleOptions}
                selectedValue={values.roleSelection}
                onValueChange={(value) => setFieldValue('roleSelection', value)}
                error={
                    touched.roleSelection && errors.roleSelection
                    ? errors.roleSelection
                    : undefined
                }
                />
              </View>

              {/* Phone Number Input */}
              <Input 
                label="Phone number"
                placeholder="+234 | Enter your phone number"
                value={values.phoneNumber}
                onChangeText={handleChange('phoneNumber')}
                onBlur={() => handleBlur('phoneNumber')}
                keyboardType="phone-pad"
                error={errors.phoneNumber}
                touched={touched.phoneNumber}
              />

              {/* Submit Button */ }
              <GradientButton
                title={loading ? 'Completing...' : 'Complete and go to home'}
                disabled={loading || !values.roleSelection || !values.phoneNumber}
                onPress={handleSubmit}
              />

              <Text style={styles.infoText}>
                This information helps us personalize your experience on Tenaly
              </Text>

              {/* Optional: Sign Out Link */ }
              <View className="mt-4">
                <Text
                  style={styles.signOutText}
                  onPress={() => {
                    Alert.alert(
                        'Sign Out',
                        'Are you sure you want to sign out?',
                        [
                         { text: 'Cancel', style: 'cancel' },
                         {
                          text: 'Sign Out',
                          onPress: () => signOut(),
                          style: 'destructive'
                         },
                        ]
                    );
                  }}
                >
                  Not you? Sign out 
                </Text>
              </View>
            </View>
           )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    );
};


const styles = StyleSheet.create({
  title: {
    color: colors.darkGray,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 20,
    marginBottom: 12,
    fontFamily: 'WorkSans_600SemiBold',
  },
  subtitle: {
   color: colors.lightGrey,
   fontSize: 14,
   fontWeight: '400',
   marginBottom: 24,
   textAlign: 'center',
   fontFamily: 'WorkSans_400Regular',
  },
  infoText: {
    color: colors.lightGrey,
    fontSize: 12,
    fontWeight: '400',
    marginTop: 16,
    textAlign: 'center',
    fontFamily: 'WorkSans_400Regular'
  },
  signOutText: {
    color: colors.blue,
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    fontFamily: 'WorkSans_400Regular',
    textDecorationLine: 'underline'
  }
})


export default CompleteProfile;
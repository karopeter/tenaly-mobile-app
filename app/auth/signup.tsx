import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    KeyboardAvoidingView, 
    Platform,
    Image,
    Dimensions,
    StyleSheet,
    ScrollView,
    TouchableOpacity
  } from 'react-native';
  import * as WebBrowser from 'expo-web-browser';
  import Input from '../components/Input';
  import { useRouter } from 'expo-router';
  import { Formik } from 'formik';
  import { makeRedirectUri } from 'expo-auth-session';
  import Icon from 'react-native-vector-icons/Ionicons';
  import GradientButton from '../components/GradientButton/GradientButton';
  import DividerWithText from '../components/DividerLine/DividerWithText';
   import { signUpSchema } from '../utils/validation';
   import apiClient from '../utils/apiClient';
   import { Dropdown } from '../components/Dropdown/dropdown';
   import AsyncStorage from '@react-native-async-storage/async-storage';
   import { AuthResponse } from '../types/auth.d';
   import { signUpInitialValues } from '../types/formHelper';
   import { showErrorToast, showSuccessToast } from '../utils/toast';
   import * as Google from 'expo-auth-session/providers/google';
   import { useAuth } from '../context/AuthContext';
   import { colors } from '../constants/theme';

   WebBrowser.maybeCompleteAuthSession();  // Required for web 

  const { width } = Dimensions.get('window');

const SignUp: React.FC = () => {
     const router = useRouter();
     const { signIn } = useAuth();
     const [showPassword, setShowPassword] = useState<boolean>(false);
     const [loading, setLoading] = useState<boolean>(false);

   // Dropdown options 
   const roleOptions = [
     { label: 'I am Buying', value: 'customer'},
     { label: 'I am Selling', value: 'seller'}
   ];

   // Force use of Expo proxy 
   const redirectUri = makeRedirectUri({
     native: 'https://auth.expo.io/@karopeter/tenaly-mobile'
   });

   // Google Auth Setup 
   const [request, response, promptAsync] = Google.useAuthRequest({
       androidClientId: '1002797729859-3a0ldqk5j14ugthoga4esjinnh4u3g00.apps.googleusercontent.com',
     iosClientId: '1002797729859-s2nujipbjpve2eg857leinnoe33aisqo.apps.googleusercontent.com',
     webClientId: '1002797729859-jg7b10igsava81902i8ltnjilee676v0.apps.googleusercontent.com',
     scopes: ['profile', 'email'],
     selectAccount: true,
   },
   {
    redirectUri,
   }
  );

   // Handle Google response with better error handling
   useEffect(() => {
     if (response?.type === 'success') {
       const { id_token } = response.params;
       if (id_token) {
         handleGoogleAuth(id_token);
       }
     } else if (response?.type === 'error') {
       console.error('Google Auth Error:', response);
       showErrorToast('Google authentication failed. Please try again.');
       setLoading(false);
     } else if (response?.type === 'cancel') {
       console.log('Google Auth Cancelled by user');
       setLoading(false);
     }
   }, [response]);

   const handleGoogleAuth = async (googleToken: string) => {
     setLoading(true);
     try {
       if (!apiClient) {
        showErrorToast('API client is not initialized. Please try again later.');
        return;
       }

       const res = await apiClient.post('/api/auth/google', {
        token: googleToken,
       });

      const { data }: { data: AuthResponse } = res;

       await signIn(data);
      showSuccessToast('Google sign-up successful! Please complete your profile.');
     
      // Redirect based on role 
      if (data.isNewGoogleUser || !data.profileComplete) {
       // router.push('/auth/complete-profile')
      } else {
        if (data.user.role === 'seller') {
          router.replace('/protected/settings');
        } else {
          router.replace('/protected/home');
        }
      }
     } catch(err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'An unknown error occurred';

      console.error('Google Signup error:', errorMessage);
      showErrorToast(errorMessage);
     } finally {
      setLoading(false);
     }
   }

   // Google Sign In Handler
   const handleGoogleSignIn = async () => {
     try {
       if (!request) {
         showErrorToast('Google authentication is not ready. Please try again.');
         return;
       }
       
       setLoading(true);
       await promptAsync();
       // The useEffect will handle the response
     } catch (error) {
       console.error('Error initiating Google sign in:', error);
       showErrorToast('Failed to start Google authentication.');
       setLoading(false);
     }
   };

 const handleSignUp = async (values: any) => {
  if (!apiClient) {
    showErrorToast('API client is not initialized. Please try again later.');
    return;
  }
   setLoading(true);
   try {
    const response = await apiClient.post('/api/auth/signup', {
      fullName: values.fullName,
      email: values.email,
      phoneNumber: values.phoneNumber,
      password: values.password,
      passwordConfirm: values.passwordConfirm,
      role: values.roleSelection,
    });

    const { data }: { data: AuthResponse } = response;

    await AsyncStorage.setItem('auth_token', data.token);
    showSuccessToast("Signup successful! 🎉 Welcome to Tenaly!");
    
    // Redirect based on role 
    if (data.user.role === 'seller') {
      router.replace('/protected/settings');
    } else {
      router.replace('/protected/home');
    }
   } catch(err: any) {
      const errorMessage = 
        err.response?.data?.message ||
        err.message ||
        'An unknown error occured';
        console.error('Error signing up:', {
          message: err.message,
          response: err.response?.data,
          stack: err.stack
        });
        showErrorToast(errorMessage);
   } finally {
    setLoading(false);
   }
 }

    return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#F8F8F8] p-6"
      >
        <View className="items-center mt-10">
          <View 
            style={{
              width: Math.min(106, width * 0.8),
              height: Math.min(52, width * 0.4),
            }}>
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
         contentContainerStyle={{ 
            flexGrow: 1, 
            justifyContent: 'center'
          }}>
         <Formik
           initialValues={signUpInitialValues}
           validationSchema={signUpSchema}
           onSubmit={handleSignUp}>
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => 
           <View 
             className="bg-white rounded-t-lg px-4 pt-6 pb-8 mx-auto mt-2"
             style={{
               width: '90%',
               maxWidth: 400,
               borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
             }}>
            <Text style={styles.signUpText}>
               Welcome to Tenaly
            </Text> 
            <Text 
              style={styles.signUpTitle}
              numberOfLines={1}
              ellipsizeMode='tail'>
               Fill in your details to enjoy all the features of Tenaly
             </Text>

              <Input 
               label="Full Name"
              placeholder="Enter your first and last name"
              value={values.fullName}
              onChangeText={handleChange('fullName')}
              onBlur={() => handleBlur('fullName')}
              error={errors.fullName}
              touched={touched.fullName}
             />

             <Input 
               label="Email"
               placeholder="Enter your email"
               value={values.email}
               onChangeText={handleChange('email')}
               onBlur={() => handleBlur('email')}
               keyboardType="email-address"
               autoCapitalize="none"
               error={errors.email}
               touched={touched.email}
             />

               {/* Role Selection Dropdown */}
            <View className="mb-4">
              <Dropdown 
                 label="What would you like to do?"
                 options={roleOptions}
                 selectedValue={values.roleSelection}
                 onValueChange={(value) => setFieldValue('roleSelection', value)}
                 error={touched.roleSelection && errors.roleSelection ? errors.roleSelection : undefined}
              />
            </View>

            <Input 
              label="Phone Number"
              placeholder="+234 | Enter your phone number"
              value={values.phoneNumber}
              onChangeText={handleChange('phoneNumber')}
              onBlur={() => handleBlur('phoneNumber')}
              error={errors.phoneNumber}
              touched={touched.phoneNumber}
            />

            <Input 
              label="Password"
              placeholder="Enter your password"
              value={values.password}
              onChangeText={handleChange('password')}
              onBlur={() => handleBlur('password')}
              secureTextEntry={!showPassword}
              error={errors.password}
              touched={touched.password}
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                   <Icon 
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#6B7280"
                    />
                </TouchableOpacity>
              }
            />

            <Input 
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={values.passwordConfirm}
              onChangeText={handleChange('passwordConfirm')}
               onBlur={() => handleBlur('passwordConfirm')}
              secureTextEntry={!showPassword}
              error={errors.passwordConfirm}
              touched={touched.passwordConfirm}
              rightIcon={
                <TouchableOpacity  onPress={() => setShowPassword(!showPassword)}>
                   <Icon  name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#6B7280" />
                </TouchableOpacity>
              }
            />
           
           <GradientButton 
            title={loading ? 'Signing Up...' : 'Sign Up'}
            disabled={loading || (!values.email) || (!values.fullName) || (!values.phoneNumber) || (!values.password)}
            onPress={handleSubmit}
           />
          <View className="mt-2">
            <Text 
              style={styles.agreeText}
              className="text-[#868686] text-center text-[12px] font-[400]">
               By Signing up, you agree to all Terms Of Service and Privacy 
               Policy
              </Text>
          </View>

          {/* Divider and Social Buttons */ }
         <View className="mt-1">
            <DividerWithText text="Or Sign up with" />

            <View className="items-center mt-4">
              <TouchableOpacity 
                className="bg-transparent border-[1px] border-[#CDCDD7]
                 rounded-[8px] px-4 py-3 flex-row items-center w-full max-w-ws justify-center"
                onPress={handleGoogleSignIn}
                disabled={!request || loading}
                >
                 <Image 
                     source={require('../../assets/images/google-img.png')}
                     style={{
                        width: 20,
                        height: 20,
                        marginRight: 8
                     }}
                 />
                  <Text 
                  style={styles.googleText}
                    className="text-[#525252] text-[16px] font-[500]">
                    {loading ? 'Connecting...' : 'Google'}
                  </Text>
              </TouchableOpacity>
            </View>
         </View>
          </View>
          }
         </Formik>
          <View 
              className="bg-[#DFDFF9] rounded-b-lg px-4 py-3 mx-auto"
              style={{
                 width: '90%',
                 maxWidth: 400,
                borderBottomLeftRadius: 24,
                borderBottomRightRadius: 24,
              }}>
               <View className="flex-row justify-center">
                  <Text 
                   style={styles.accountText}
                   className="text-center text-[#868686] text-[14px] font-[400]">
                      Already have an account? {' '}
                  </Text>
                  <TouchableOpacity 
                     activeOpacity={0.7}
                     onPress={() => router.push('/auth/login')}
                     >
                     <Text 
                     style={styles.accountText}
                      className="text-center text-[14px] 
                      text-[#000087] font-[400]">
                      Sign In
                     </Text>
                  </TouchableOpacity>
               </View>
            </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
  signUpText: {
    color: colors.darkGray,
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 18,
    marginBottom: 20,
    fontFamily: 'WorkSans_600SemiBold'
  },
  signUpTitle: {
     color: colors.lightGrey,
     fontSize: 14,
     fontWeight: '400',
     marginBottom: 20,
     fontFamily: 'WorkSans_400Regular'
  },
  agreeText: {
    fontFamily: 'WorkSans_400Regular',
    marginTop: 5,
  },
  googleText: {
    fontFamily: 'WorkSans_600SemiBold'
  },
  accountText: {
    fontFamily: 'WorkSans_400Regular'
  }
})

export default SignUp;
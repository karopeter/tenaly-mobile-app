import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { Formik } from 'formik';
import Input from '../components/Input';
import Icon from 'react-native-vector-icons/Ionicons';
import GradientButton from '../components/GradientButton/GradientButton';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { showErrorToast, showSuccessToast } from '../utils/toast';
import apiClient from '../utils/apiClient';
import { AuthResponse } from '../types/auth.d';
import { loginInitialValues } from '../types/formHelper';
import TabButtons, { TabButtonType } from '../components/TabButton';
import DividerWithText from '../components/DividerLine/DividerWithText';
import { loginSchema } from '../utils/validation';
import { colors } from '../constants/theme';

const { width } = Dimensions.get('window');

export enum CustomTab {
  Email,
  Phone,
}


const Login = () => {
  //const [selectedTab, setSelectedTab] = useState<CustomTab>(CustomTab.Email);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const buttons: TabButtonType[] = [
    { title: 'Email' },
    { title: 'Phone Number' },
  ];

    // Google Auth Setup
  // const redirectUri = makeRedirectUri({
  //   native: 'https://auth.expo.io/@karopeter/tenaly-mobile',
  // });

//  const redirectUri = makeRedirectUri();
//  console.log('Redirect URI:', redirectUri);
const redirectUri = 'https://auth.expo.io/@karopeter531/tenaly-mobile';
console.log('Redirect URI:', redirectUri);

const [request, response, promptAsync] = Google.useAuthRequest(
  {
    iosClientId: '1002797729859-jg7b10igsava81902i8ltnjilee676v0.apps.googleusercontent.com',
    androidClientId: '1002797729859-jg7b10igsava81902i8ltnjilee676v0.apps.googleusercontent.com',
    webClientId: '1002797729859-jg7b10igsava81902i8ltnjilee676v0.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
  },
  { redirectUri }
);

  //const redirectUri = makeRedirectUri({ useProxy: true });


// for production testing 
  //   const [request, response, promptAsync] = Google.useAuthRequest(
  //   {
  //      androidClientId: '1002797729859-3a0ldqk5j14ugthoga4esjinnh4u3g00.apps.googleusercontent.com',
  //      iosClientId: '1002797729859-s2nujipbjpve2eg857leinnoe33aisqo.apps.googleusercontent.com',
  //     webClientId: '1002797729859-jg7b10igsava81902i8ltnjilee676v0.apps.googleusercontent.com',
  //     scopes: ['profile', 'email'],
  //   },
  //   { redirectUri }
  // );

  // for expo Go Testing 

   // const redirectUri = promptAsync({ useProxy: true });

  // Handle Google response 

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      if (id_token) handleGoogleAuth(id_token);
    } else if (response?.type === 'error') {
      showErrorToast("Google login failed:" + (response.error ?? 'Unknown error'));
    }
  }, [response]);

  const handleGoogleAuth = async (googleToken: string) => {
     setLoading(true);

     try {
      if(!apiClient) {
        showErrorToast('API client is not initialized. Please try again later.');
        return;
      }

      const res = await apiClient.post('/api/auth/google', { token: googleToken });
        const { data }: { data: AuthResponse } = res;
        await signIn(data);
        showSuccessToast('Google Authentication logged in successfully!');

        // Redirect based on role 
        if (data.isNewGoogleUser || !data.profileComplete) {
          // router.push('/auth/complete-profile')
        } else {
          if (data.user.role === 'seller') {
            router.replace('/protected/settings')   
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
  

  const handleLogin = async (values: any) => {
  setLoading(true);
  try {
    if (!apiClient) {
      showErrorToast('API client not initialized.');
      return;
    }

    const res = await apiClient.post('/api/auth/login', {
      login: values.login.trim(),
      password: values.password,
    });

    const { data }: { data: AuthResponse } = res;
    await signIn(data);
    //showSuccessToast('Login successful! 🎉 Welcome back!');

    // Redirect based on role 
    if (data.user.role === 'seller') {
      router.replace('/protected/settings');
    } else {
      router.replace('/protected/home');
    }
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message || 'Invalid credentials';
    showErrorToast(msg);
  } finally {
    setLoading(false);
  }
};

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#F8F8F8]"
    >
      {/* Logo */}
      <View className="items-center mt-10">
        <View
          style={{
            width: Math.min(106, width * 0.8),
            height: Math.min(52, width * 0.4),
          }}
        >
          <Image
            source={require('../../assets/images/tenaly-logo.png')}
            style={{
              width: '100%',
              height: '100%',
              resizeMode: 'contain',
            }}
          />
        </View>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <Formik
           initialValues={loginInitialValues}
           validationSchema={loginSchema}
           onSubmit={handleLogin}
         >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
            <>
         <View
          className="bg-white rounded-t-lg px-4 pt-6 pb-8 mx-auto mt-2"
          style={{
            width: '90%',
            maxWidth: 400,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
          }}
        >
          <Text 
           style={styles.signUpText}
          >
            Welcome to Tenaly
          </Text>
          <Text style={styles.signUpTitle}>
            Sign in with your details to enjoy all the features of Tenaly
          </Text>

          {/* Tabs */}
           <TabButtons
             buttons={buttons}
             selectedTab={values.selectedTab}
             setSelectedTab={(index) => {
               setFieldValue('selectedTab', index);
               setFieldValue('login', '');
             }}
            />

          <View className="mt-2" />

          {/* Conditional Inputs */}
          {values.selectedTab === CustomTab.Email && (
            <>
             <Input
               label={values.selectedTab === CustomTab.Email ? 'Email' : 'Phone Number'}
                placeholder={
                values.selectedTab === CustomTab.Email
                 ? 'Enter your email'
                 : '+234 | Enter your phone number'
               }
               value={values.login}
               onChangeText={handleChange('login')}
               onBlur={() => handleBlur('login')}
               keyboardType={values.selectedTab === CustomTab.Email ? 'email-address' : 'phone-pad'}
               autoCapitalize="none"
               error={touched.login ? errors.login : undefined}
              touched={touched.login}
              />

              <Input
                label="Password"
                placeholder="Enter your password"
                value={values.password}
                onChangeText={handleChange('password')}
                onBlur={() => handleBlur('password')}
                secureTextEntry={!showPassword}
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

             {/* Forgot Password Text */}
            <View className="ml-1 flex-row flex-wrap">
              <Text 
               style={styles.forgotText}
                className="text-[#868686] text-sm">Forgot Password?</Text>
               <TouchableOpacity 
                onPress={() => router.push('/auth/forgot-password')}
                 className="ml-1 rounded-full" activeOpacity={0.7}>
                <Text style={styles.forgotText} className="text-[#00A8DF] text-sm font-medium underline">Reset</Text>
             </TouchableOpacity>
            </View>
            </>
            )}

          {values.selectedTab === CustomTab.Phone && (
            <>
              <Input
                label="Phone Number"
                placeholder="+234 | Enter your phone number"
                value={values.login}
                onChangeText={handleChange('login')}
                onBlur={() => handleBlur('login')}
                error={touched.login ? errors.login : undefined}
                touched={touched.login}
              />

              <Input
                label="Password"
                placeholder="Enter your password"
                value={values.password}
                onChangeText={handleChange('password')}
                onBlur={() => handleBlur('password')}
                secureTextEntry={!showPassword}
                error={touched.password ? errors.password : undefined}
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

             {/* Forgot Password Text */}
            <View className="ml-1 flex-row flex-wrap">
              <Text  style={styles.forgotText} className="text-[#868686] text-sm">Forgot Password?</Text>
               <TouchableOpacity 
                onPress={() => router.push('/auth/forgot-password')}
                className="ml-1 rounded-full" activeOpacity={0.7}>
                <Text style={styles.forgotText} className="text-[#00A8DF] text-sm font-medium underline">Reset</Text>
             </TouchableOpacity>
            </View>
            </>
          )}

          {/* Sign In Button */}
          <View className="mt-5" />
          <GradientButton
            title={loading ? 'Signing In...' : 'Sign In'}
            onPress={async () => {
              await handleLogin(values);
            }}
            disabled={loading || (!values.login) || (!values.password)}
          />

          {/* Divider and Social Buttons */}
          <View className="mt-4">
            <DividerWithText text="Or Sign In with" />
          </View>
          
          <View className="items-center mt-4">
            <TouchableOpacity
              className="bg-transparent border-[1px] border-[#CDCDD7]
               rounded-[8px] px-4 py-3 flex-row items-center w-full max-w-ws justify-center"
                onPress={() => promptAsync()}
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
                 <Text style={styles.forgotText} className="text-[#525252] text-[16px] font-[500]">Google</Text>
            </TouchableOpacity>
            </View>
          </View>
            </>
          )}
        </Formik>
         {/* Bottom Sign Up Link */}
      <View
        className="bg-[#DFDFF9] rounded-b-lg px-4 py-3 mx-auto"
        style={{
          width: '90%',
          maxWidth: 400,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
        }}
      >
        <View className="flex-row justify-center">
          <Text
           style={styles.forgotText}
          className="text-center text-[#868686] text-[14px] font-normal">
            Don't have an account?
          </Text>
          <TouchableOpacity 
             activeOpacity={0.7}
             onPress={() => router.push('/auth/signup')}
            >
            <Text 
             style={styles.forgotText}
            className="text-[#000087] text-[14px] font-normal ml-1">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

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
  forgotText: {
    fontFamily: 'WorkSans_400Regular'
  },
})

export default Login;
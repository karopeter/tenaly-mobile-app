import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Input from '../components/Input';
import Icon from 'react-native-vector-icons/Ionicons';
import GradientButton from '../components/GradientButton/GradientButton';
import { useRouter } from 'expo-router';
import TabButtons, { TabButtonType } from '../components/TabButton';
import DividerWithText from '../components/DividerLine/DividerWithText';
import { loginSchema } from '../utils/validation';

const { width } = Dimensions.get('window');

// 🔁 Define tab types
export enum CustomTab {
  Email,
  Phone,
}

interface LoginFormValues {
  email: string;
  phoneNumber: string;
  password: string;
  selectedTab?: number; 
}

const initialValues: LoginFormValues = {
  email: '',
  phoneNumber: '',
  password: '',
  selectedTab: CustomTab.Email
};



const Login = () => {
  const [selectedTab, setSelectedTab] = useState<CustomTab>(CustomTab.Email);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const buttons: TabButtonType[] = [
    { title: 'Email' },
    { title: 'Phone Number' },
  ];

  const handleLogin = async (values: LoginFormValues) => {
     try {
      // set loading state 
      setLoading(true);
       
      const { email, phoneNumber, password, selectedTab } = values;

      // Prepare request body based on tab 
      const isEmaillogin = selectedTab === CustomTab.Email;
      const payload = { 
        [isEmaillogin ? 'email' : 'phoneNumber']: isEmaillogin ? email : phoneNumber,
        password
      };

      console.log('Submitting:', payload);

      // URL endpoints 
       const response = await fetch('',  {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    // Simulate network delay 
    setTimeout(async () => {
      if (!response.ok) {
        throw new Error(result.message || 'Login failed');
      }

      // Login successful 
      console.log('Login Success:', result);
      setLoading(false);
      // router.push('/');
    }, 1000);
     } catch (err: any) {
        setLoading(false);
        Alert.alert('Login failed', err.message || 'Invalid credentials. Please try again.');
        console.error('Login Error:', err.message);
     }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#F8F8F8] p-6"
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
           initialValues={initialValues}
           validationSchema={loginSchema}
           onSubmit={handleLogin}
         >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
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
          <Text className="text-[#525252] text-center font-bold text-[18px] mb-5">
            Welcome to Tenaly
          </Text>
          <Text className="text-[#868686] text-[14px] font-normal mb-6">
            Sign in with your details to enjoy all the features of Tenaly
          </Text>

          {/* Tabs */}
           <TabButtons
             buttons={buttons}
             selectedTab={selectedTab}
             setSelectedTab={setSelectedTab}
            />

          <View className="mt-2" />

          {/* Conditional Inputs */}
          {selectedTab === CustomTab.Email && (
            <>
              <Input
                label="Email"
                placeholder="Enter your email"
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={() => handleBlur('email')}
                keyboardType="email-address"
                autoCapitalize="none"
                error={touched.email ? errors.email : undefined}
                touched={touched.email}
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
              <Text className="text-[#868686] text-sm">Forgot Password?</Text>
               <TouchableOpacity 
                onPress={() => router.push('/auth/forgot-password')}
                 className="ml-1 rounded-full" activeOpacity={0.7}>
                <Text className="text-[#00A8DF] text-sm font-medium underline">Reset</Text>
             </TouchableOpacity>
            </View>
            </>
            )}

          {selectedTab === CustomTab.Phone && (
            <>
              <Input
                label="Phone Number"
                placeholder="+234 | Enter your phone number"
                value={values.phoneNumber}
                onChangeText={handleChange('phoneNumber')}
                onBlur={() => handleBlur('phoneNumber')}
                error={touched.phoneNumber ? errors.phoneNumber : undefined}
                touched={touched.phoneNumber}
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
              <Text className="text-[#868686] text-sm">Forgot Password?</Text>
               <TouchableOpacity 
                onPress={() => router.push('/auth/forgot-password')}
                className="ml-1 rounded-full" activeOpacity={0.7}>
                <Text className="text-[#00A8DF] text-sm font-medium underline">Reset</Text>
             </TouchableOpacity>
            </View>
            </>
          )}

          {/* Sign In Button */}
          <View className="mt-5" />
          <GradientButton
            title="Sign In"
            onPress={handleLogin}
            disabled={
              (selectedTab === CustomTab.Email && (!values.email || !values.password)) ||
              (selectedTab === CustomTab.Phone && (!values.phoneNumber)) ||
              (!values.password)
            }
          />

          {/* Divider and Social Buttons */}
          <View className="mt-4">
            <DividerWithText text="Or Sign In with" />
          </View>
          
          <View className="items-center mt-4">
            <TouchableOpacity
              className="bg-transparent border-[1px] border-[#CDCDD7]
               rounded-[8px] px-4 py-3 flex-row items-center w-full max-w-ws justify-center">
                <Image 
                  source={require('../../assets/images/google-img.png')}
                  style={{
                    width: 20,
                    height: 20,
                    marginRight: 8
                  }}
                />
                 <Text className="text-[#525252] text-[16px] font-[500]">Google</Text>
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
          <Text className="text-center text-[#868686] text-[14px] font-normal">
            Don't have an account?
          </Text>
          <TouchableOpacity 
             activeOpacity={0.7}
             onPress={() => router.push('/auth/signup')}
            >
            <Text className="text-[#000087] text-[14px] font-normal ml-1">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;
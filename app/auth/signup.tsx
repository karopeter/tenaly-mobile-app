import React, { useState } from 'react';
import { 
    View, 
    Text, 
    KeyboardAvoidingView, 
    Platform,
    Image,
    Dimensions,
    ScrollView,
    TouchableOpacity
  } from 'react-native';
  import Input from '../components/Input';
  import { useRouter } from 'expo-router';
  import { Formik } from 'formik';
  import Icon from 'react-native-vector-icons/Ionicons';
  import GradientButton from '../components/GradientButton/GradientButton';
  import DividerWithText from '../components/DividerLine/DividerWithText';
import { signUpSchema } from '../utils/validation';

  const { width } = Dimensions.get('window');

  interface SignUpFormValues {
    email: string;
    fullName: string;
    phoneNumber: string;
    password: string;
  }

  const initialValues: SignUpFormValues = {
    email: '',
    fullName: '',
    phoneNumber: '',
    password: ''
  };

const SignUp: React.FC = () => {
     const router = useRouter();
     const [email, setEmail] = useState<string>('');
     const [fullName, setFullName] = useState<string>('');
     const [phoneNumber, setPhoneNumber] = useState<string>('');
     const [password, setPassword] = useState<string>('');
     const [showPassword, setShowPassword] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);


   const handleSignUp = async (values: SignUpFormValues) => {
      setLoading(true);

      try {
         console.log('Submitted values:', values);
         // Simulate API call
         setTimeout(() => {
          alert('Sign up successful');
          router.push('/auth/login');
         }, 1500);
      } catch (err) {
         alert('Something went wrong');
         setLoading(false)
      }
   };

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
           initialValues={initialValues}
           validationSchema={signUpSchema}
           onSubmit={handleSignUp}>
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
           <View 
          className="bg-white rounded-t-lg px-4 pt-6 pb-8 mx-auto mt-2"
           style={{
             width: '90%',
             maxWidth: 400,
             borderTopLeftRadius: 24,
             borderTopRightRadius: 24,
           }}>
            <Text className="text-[#525252] text-center font-[500] text-[18px] mb-5">Welcome to Tenaly</Text> 
            <Text 
              className="text-[#868686] text-[14px] font-normal mb-2"
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


            {/* {touched && errors && <Text className="text-red-500 text-sm mt-1">{errors}</Text>} */}
           
           <GradientButton 
            title={loading ? 'Signing Up...' : 'Sign Up'}
            disabled={loading || (!values.email) || (!values.fullName) || (!values.phoneNumber) || (!values.password)}
            onPress={handleSubmit}
           />
          <View className="mt-2">
            <Text className="text-[#868686] text-center text-[12px] font-[400]">
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
          </View>
          )}
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
                  <Text className="text-center text-[#868686] text-[14px] font-[400]">
                      Already have an account? {' '}
                  </Text>
                  <TouchableOpacity 
                     activeOpacity={0.7}
                     onPress={() => router.push('/auth/login')}
                     >
                     <Text className="text-center text-[14px] text-[#000087] font-[400]">Sign In</Text>
                  </TouchableOpacity>
               </View>
            </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
}

export default SignUp;
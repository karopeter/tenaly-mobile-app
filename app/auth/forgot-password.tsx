import React, { useState } from 'react';
import {
   View, 
   Text,
   TouchableOpacity,
   KeyboardAvoidingView,
   Platform,
   Image,
   Dimensions,
   ScrollView
} from 'react-native';
import Input from '../components/Input';
import GradientButton from '../components/GradientButton/GradientButton';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');


const ForgotPassword: React.FC = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const validateEmail = (input: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(input);
    };

    const handleContinue = () => {
        if (!validateEmail(email)) {
          setError('Please enter a valid email address');
          return;
        }

        setError('');
        setLoading(true);

        // Simulate API call 
        setTimeout(() => {
          alert('Code sent to your email');
          setLoading(false);
          // Navigate to "Enter code" screen next
          router.push('/auth/verify-code');
        }, 1500);
    };


    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-[#F8F8F8] p-6">
        
        {/* Header with Back Arrow and Logo */}
        <View className="flex-row items-center justify-between mt-10">
          {/* Back Arrow */ }
          <TouchableOpacity onPress={() => router.back()}>
            <Icon name="arrow-back" size={24} color="#141B34" />
          </TouchableOpacity>

          {/* Centered Logo */ }
          <View className="absolute left-0 right-0 flex-1 items-center justify-center pointer-events-none">
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
          {/* Empty placeholder to align logo in center */ }
          <View style={{ width: 24 }} />
        </View>
         <ScrollView 
           keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1, marginTop: 50, }}>
             <View className="items-start w-full  mb-6">
                <Text className="text-[#525252] text-[18px] font-bold">Forgot Password</Text>
                <Text className="text-[#868686] text-sm mt-2">
                    Enter your email so you can receive a code to reset your password.
                </Text>
             </View>

             {/* Email Input */}
             <Input 
               label="Email"
               placeholder="Enter your email"
               value={email}
               onChangeText={(text) => {
                 setEmail(text);
                 if (error) setError('');
               }}
               onBlur={() => {}}
               keyboardType="email-address"
               autoCapitalize="none"
             />

             {/* Error Message */ }
             {error && <Text className="text-red-500 text-sm mt-2 self-start">{error}</Text>}

             {/* Continue Button */ }
             <View className="mt-5" />
             <GradientButton 
               title={loading ? 'Sending...' : 'Continue'}
               disabled={loading || !validateEmail(email)}
               onPress={handleContinue}
             />
          </ScrollView>
      </KeyboardAvoidingView>
    );
}

export default ForgotPassword;
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import GradientButton from '../components/GradientButton/GradientButton';
import Input from '../components/Input';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const ResetPasswordScreen: React.FC = () => {
     const router = useRouter();
     const [newPassword, setNewPassword] = useState<string>('');
     const [confirmPassword, setConfirmPassword] = useState<string>('');
     const [showPassword, setShowPassword] = useState<boolean>(false);
     const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
     const [error, setError] = useState<string>('');

      const handleResetPassword = () => {
        if (!newPassword || !confirmPassword) {
            setError('Please fill in all fields.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        router.push('/auth/success');

        setError('');
        // Simulate API call
        alert('Password reset successful!');
      }

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
           {/* Empty placeholder for alignment */}
           <View style={{ width: 24 }} />
         </View>

         <ScrollView
          keyboardShouldPersistTaps="handled"
           contentContainerStyle={{ flexGrow: 1, marginTop: 50}}>
            <Text className="text-[#525252] text-xl font-bold mb-2">Reset Password</Text>
           
           <View className="mt-5" />
           <Input 
              label="New Password"
              placeholder="Enter your new password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showPassword}
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
              label="Confirm New Password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
               rightIcon={
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                     <Icon
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#6B7280"
                    />
                </TouchableOpacity>
              }
             />

             {/* Error message */}
             {error && <Text className="text-red-500 text-sm mb-4">{error}</Text>}

             {/* Continue Button */ }
             <View className="mt-5" />
             <GradientButton
               title="Reset Password"
               disabled={!newPassword || !confirmPassword}
               onPress={handleResetPassword}
             />
             <View style={{ height: 40 }} />
         </ScrollView>
     </KeyboardAvoidingView>
    );
}

export default ResetPasswordScreen;
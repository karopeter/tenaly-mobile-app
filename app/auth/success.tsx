import React from 'react';
import {
    ScrollView,
    View,
    Image,
    Text
} from 'react-native';
import GradientButton from '../components/GradientButton/GradientButton';
import { useRouter } from 'expo-router';


const ResetPasswordSuccess: React.FC = () => {
  const router = useRouter();
   return (
     <View className="flex-1 bg-[#F8F8F8] p-6 justify-center">
       <ScrollView 
         contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Image 
             source={require('../../assets/images/success.png')}
             style={{
               width: 150,
               height: 150,
               resizeMode: 'contain',
               marginBottom: 24,
             }}
           />
           {/* Title */ }
           <Text className="text-[#525252] font-bold text-xl mb-4 text-center">
              Password Reset Successful
           </Text>
           {/* Subtitle */}
           <Text className="text-[#868686] text-sm text-center mb-8 px-4">
              Your password has been successfully reset. You can log in with your new password.
           </Text>

           <GradientButton
             title="Sign In"
             onPress={() => router.push('/auth/login')}
           />
       </ScrollView>
     </View>
   )
}

export default ResetPasswordSuccess;
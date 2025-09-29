import React, { useState } from 'react';
import { 
   View, 
   Text, 
   TextInput,
   TouchableOpacity,
   KeyboardAvoidingView,
   Platform,
   ScrollView,
   Image,
   Dimensions
  } from 'react-native';
 import { useRouter } from 'expo-router';
 import GradientButton from '../components/GradientButton/GradientButton';
 import Icon from 'react-native-vector-icons/Ionicons';

 const { width } = Dimensions.get('window');

const VerifyCodeScreen: React.FC = () => {
  const router = useRouter();
  const [code, setCode] = useState(['', '', '', '']);
  //const [loading, setLoading] = useState(false);

  const handleChangeText = (text: string, index: number) => {
    if (text.length > 1) return; // Prevent pasting multiple letters in one fields 

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-focus next input 
    if (text && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleContinue = () => {
    const fullCode = code.join('');
    if (fullCode.length === 4) {
      alert(`Code entered: ${fullCode}`);
      // Replace with real API call when ready for integration
      router.push('/auth/reset-password');
    } else {
      alert('Please enter the full 4-digit code.');
    }
  };

  const inputsRef = React.useRef<TextInput[]>([]);

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-[#F8F8F8] p-6">
        {/* Header with Back Arrow and Logo */ }
        <View className="flex-row items-center justify-between mt-10">
          <TouchableOpacity onPress={() => router.back()}>
             <Icon name="arrow-back" size={24} color="#141B34" />
          </TouchableOpacity>

          {/* Centered Logo */} 
          <View className="absolute left-0 right-0 flex items-center justify-center pointer-events-none">
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
          {/* Emoty Placeholder for Balance */}
          <View style={{ width: 24 }} />
        </View>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, marginTop: 50 }}>
          {/* Title */}
          <Text className="text-[#525252] text-[18px] font-bold">Let's verify it's you</Text>
          <Text className="text-[#868686] text-sm mb-6">
            Enter code sent to your email
          </Text>

          {/* Code Inputs */}
          <View className="flex-row gap-6 justify-center w-full mb-6">
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputsRef.current[index] = ref)}
                value={digit}
                onChangeText={(text) => handleChangeText(text, index)}
                keyboardType="number-pad"
                maxLength={1}
                className="w-14 h-14 border border-[#CDCDD7] rounded-lg text-center text-xl"
                style={{ fontSize: 20, fontWeight: 'bold'}}
              />
            ))}
          </View>

          {/* Gradient Button */ }
          <View className="mt-5" />
          <GradientButton
            title="Submit"
            disabled={code.some(digit => digit === '')}
            onPress={handleContinue}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    );
}


export default VerifyCodeScreen;
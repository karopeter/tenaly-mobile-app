import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';


interface GradientButtonProps {
    title: string;
    onPress: () => void;
    disabled: boolean;
}

const GradientButton: React.FC<GradientButtonProps> = ({
    title,
    onPress,
    disabled = false
}) => {
    return (
      <TouchableOpacity
        className="w-full"
         activeOpacity={0.7} onPress={onPress} disabled={disabled}>
        <View 
          className={`justify-center items-center ${
             disabled ? 'bg-[#EDEDED]' : ''
          }`}
           style={{
             backgroundColor: disabled ? '#EDEDED' : 'transparent',
             height: 52,
             borderRadius: 8,
           }}>
            {!disabled && (
              <LinearGradient
               colors={['#00A8DF', '#1031AA']}
               start={{ x: 0, y: 0 }}
               end={{ x: 1, y: 0 }}
                style={{
                    position: 'absolute',
                    width: '100%',
                     height: '100%',
                     borderRadius: 8,
                     justifyContent: 'center',
                     alignItems: 'center',
                    }}
                />
               )}
            <Text className={`font-bold text-center text-white font-[400] text-[12px] ${
               disabled ? 'text-[#CDCDD7]' :  ''
            }`}>
            {title}</Text>
        </View>
      </TouchableOpacity>
    )
}

export default GradientButton;

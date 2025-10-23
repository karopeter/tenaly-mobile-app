import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientButtonProps {
    title: string;
    onPress: () => void;
    disabled?: boolean;
    disabledBgColor?: string; 
}

const GradientButton: React.FC<GradientButtonProps> = ({
    title,
    onPress,
    disabled = false,
    disabledBgColor,
}) => {
  const defaultDisabledColor = '#EDEDED';
  const disabledTextColor = '#868686';

    return (
      <TouchableOpacity
        className="w-full"
         activeOpacity={0.7} 
         onPress={onPress} 
         disabled={disabled}
         >
        <View 
          className={`justify-center items-center ${
             disabled ? 'bg-[#EDEDED]' : ''
          }`}
           style={{
             backgroundColor: disabled 
             ? disabledBgColor || defaultDisabledColor 
             : 'transparent',
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
               <Text
                style={[
                 styles.btnText,
                {
                  color: disabled ? disabledTextColor : '#FFFFFF', 
                },
               ]}
             className="font-bold text-center font-[400] text-[12px]">
             {title}
        </Text>
        </View>
      </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
  btnText: {
    fontFamily: 'WorkSans_400Regular'
  }
})

export default GradientButton;

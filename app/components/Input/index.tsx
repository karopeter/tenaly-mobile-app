import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet
} from 'react-native';

import { InputProps } from './input.types';

const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  containerClassName = '',
  inputClassName = '',
  rightIcon,
  touched = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const hasValue = !!value;

  return (
    <View className={`mb-4 ${containerClassName}`}>
      <View className="relative">
        {/* Floating Label */}
        {label && (
          <Text
           style={styles.labelText}
           className={`
          absolute z-10 left-3 px-1 bg-[#F8F8F8] 
           ${isFocused || hasValue
           ? 'top-[4px] text-[11px] text-blue-600'
           : 'top-[18px] text-[14px] text-gray-500'
          }
       `}>
       {label}
      </Text>
      )}

        {/* Input Field Container */}
        <View 
          className="flex-row items-center border 
          border-[#CDCDD7] 
          rounded-[4px] w-full bg-transparent">
          <TextInput
            placeholder={(isFocused || hasValue) ? '' : placeholder} // Prevents overlap
            placeholderTextColor="#CDCDD7"
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
             style={{ color: '#525252' }} 
            onFocus={() => setIsFocused(true)}
            onBlur={onBlur}
            className={`
              flex-1 pt-4 pb-2 px-4 text-[14px] h-[52px] rounded-[4px]
              ${error ? 'border-red-500' : ''}
              ${inputClassName}
            `}
          />
          {rightIcon && (
            <View className="absolute right-3 h-full justify-center">
              {rightIcon}
            </View>
          )}
        </View>
      </View>

      {/* Error Message */}
      {touched && error && (
        <Text className="text-red-500 text-sm mt-1">{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  labelText: {
   fontFamily: 'WorkSans_600SemiBold'
  }
})

export default Input;

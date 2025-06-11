import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput
} from 'react-native';

import { InputProps } from './input.types';

const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  containerClassName = '',
  inputClassName = '',
  rightIcon,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const hasValue = !!value;

  return (
    <View className={`mb-4 ${containerClassName}`}>
      <View className="relative">
        {/* Floating Label */}
        {label && (
          <Text
  className={`
    absolute z-10 left-3 px-1 bg-[#F8F8F8] 
    ${
      isFocused || hasValue
        ? 'top-[10px] text-[11px] text-blue-600'
        : 'top-[5px] text-[14px] text-gray-500'
    }
  `}
>
  {label}
</Text>
        )}

        {/* Input Field Container */}
        <View className="flex-row items-center border border-[#CDCDD7] rounded-[4px] w-full bg-white">
          <TextInput
            placeholder={(isFocused || hasValue) ? '' : placeholder} // Prevents overlap
            placeholderTextColor="#CDCDD7"
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
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
      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
    </View>
  );
};

export default Input;

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
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
            style={[
              styles.labelText,
              {
                position: 'absolute',
                left: 14,
                backgroundColor: '#fff',
                zIndex: 2,
                //top: isFocused || hasValue ? 4 : 18,
                fontSize: isFocused || hasValue ? 11 : 14,
                color: isFocused ? '#007AFF' : '#6B7280',
              },
            ]}
          >
            {label}
          </Text>
        )}

        {/* Input Container */}
        <View className="flex-row items-center border border-[#CDCDD7] rounded-[6px] w-full bg-transparent">
          <TextInput
            placeholder={!isFocused && !hasValue ? placeholder : ''}
            placeholderTextColor="#A1A1AA"
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            style={{ color: '#525252' }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false);
              onBlur && onBlur();
            }}
            className={`flex-1 text-[14px] h-[52px] px-4 rounded-[6px] ${inputClassName}`}
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
    fontFamily: 'WorkSans_600SemiBold',
  },
});

export default Input;

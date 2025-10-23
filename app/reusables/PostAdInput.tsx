import React from 'react';
import {
 View, 
 Text, 
 TextInput,
 StyleSheet,
 KeyboardTypeOptions
} from 'react-native';
import { colors } from '../constants/theme';

interface PostAdInputProps {
    label: string;
    placeholder: string;
    value: string;
    onChangeText: (value: string) => void;
    keyboardType?: KeyboardTypeOptions;
    multiline?: boolean;
    numberOfLines?: number;
    maxLength?: number;
}

const PostAdInput: React.FC<PostAdInputProps> = ({ 
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  multiline = false,
  numberOfLines,
  maxLength,
}) => {
  return (
    <View style={styles.fieldContainer}>
     <Text style={styles.label}>{label}</Text>
     <TextInput 
        style={[styles.input, multiline && styles.textArea]}
        placeholder={placeholder}
        placeholderTextColor={colors.darkGray}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
        maxLength={maxLength}
     />
    </View>
  );
}


const styles = StyleSheet.create({
  fieldContainer: {
  flex: 1,
  },
   label: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'WorkSans_600SemiBold',
    color: colors.darkGray,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: colors.black,
    height: 52,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
});

export default PostAdInput;
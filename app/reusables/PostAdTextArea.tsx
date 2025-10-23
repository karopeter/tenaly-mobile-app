import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';

interface PostAdTextAreaProps {
    label: string;
    placeholder: string;
    value: string;
    onChangeText: (value: string) => void;
    maxLength?: number;
}


const PostAdTextArea: React.FC<PostAdTextAreaProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  maxLength = 500,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput 
        style={styles.textArea}
        placeholder={placeholder}
        placeholderTextColor={colors.darkGray}
        value={value}
        onChangeText={onChangeText}
        multiline
        numberOfLines={4}
        maxLength={maxLength}
       />
       <Text style={styles.counter}>0/{maxLength}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
 container: {
    marginTop: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.black,
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: colors.black,
    height: 100,
    textAlignVertical: 'top',
  },
  counter: {
    fontSize: 12,
    color: colors.darkGray,
    textAlign: 'right',
    marginTop: 4,
  },
});

export default PostAdTextArea;
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { colors } from '../constants/theme';

interface PostAdDropdownProps {
    label: string;
    value: string;
    placeholder?: string;
    onPress: () => void;
}


const PostAdDropdown: React.FC<PostAdDropdownProps> = ({
  label,
  value,
  placeholder = 'Select',
  onPress,
}) => {
 return (
   <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.dropdown} onPress={onPress}>
       <Text 
         style={value ? styles.dropdownTextFilled : styles.dropdownTextPlaceholder}
       >
        {value || placeholder}
       </Text>
       <AntDesign name="down" size={16} color={colors.darkGray} />
      </TouchableOpacity>
   </View>
 );
};


const styles = StyleSheet.create({
  fieldContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkGray,
    fontFamily: 'WorkSans_600SemiBold',
    marginBottom: 8,
    marginTop: 16,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    height: 52,
  },
  dropdownTextPlaceholder: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'WorkSans_400Regular',
    color: colors.border,
  },
  dropdownTextFilled: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'WorkSans_500Medium',
    color: colors.darkGray,
  },
});

export default PostAdDropdown;
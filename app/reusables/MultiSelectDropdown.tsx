import React, { useState } from 'react';
import {
 View,
 Text,
 Modal,
 TouchableOpacity,
 ScrollView,
 StyleSheet
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { colors } from '../constants/theme';


interface MultiSelectDropdownProps {
  label: string;
  selectedValues: string[];
  options: string[];
  onChange: (values: string[]) => void;
}


const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({ 
  label,
  selectedValues,
  options,
  onChange
}) => {
  const [visible, setVisible] = useState(false);
  const toggleOption = (option: string) => {
    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter((v) => v !== option));
    } else {
      onChange([...selectedValues, option]);
    }
  };

  return (
    <>
    {/* Trigger Button */}
    <View style={{ marginTop: 16 }}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
       style={styles.dropdown}
       onPress={() => setVisible(true)}
      >
       <Text
        style={
            selectedValues.length > 0
            ? styles.dropdownTextFilled 
            : styles.dropdownTextPlaceholder
        }
       >
         {selectedValues.length > 0 
           ? selectedValues.join(',')
           : 'Select one or more'}
       </Text>
       <AntDesign name="down" size={16} color={colors.darkGray} />
      </TouchableOpacity>
    </View>

    {/* Modal */ }
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
         <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{label}</Text>
            <TouchableOpacity onPress={() => setVisible(false)}>
                <AntDesign name="close" size={22} color={colors.darkGray} />
            </TouchableOpacity>
         </View>

         <ScrollView>
            {options.map((option) => {
              const isSelected = selectedValues.includes(option);
              return (
                <TouchableOpacity
                  key={option}
                  style={styles.optionRow}
                  onPress={() => toggleOption(option)}
                >
                 <Text style={styles.optionText}>{option}</Text>
                 {isSelected ? (
                   <AntDesign name="check-square" size={20} color={colors.blue} />
                 ): (
                  <AntDesign name="check-square" size={20} color={colors.lightGrey} />
                 )}
                </TouchableOpacity>
              )
            })}
         </ScrollView>

         <TouchableOpacity
           style={styles.doneButton}
           onPress={() => setVisible(false)}
         >
            <Text style={styles.doneText}>Done</Text>
         </TouchableOpacity>
        </View> 
      </View>
    </Modal>
    </>
  );
};


const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'WorkSans_600SemiBold',
    color: colors.darkGray,
    marginBottom: 8,
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
    color: colors.lightGrey,
  },
  dropdownTextFilled: {
    fontSize: 14,
    color: colors.black,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionText: {
    fontSize: 15,
    color: colors.darkGray,
  },
  doneButton: {
    marginTop: 20,
    backgroundColor: colors.blue,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  doneText: {
    color: colors.bg,
    fontWeight: '600',
    fontSize: 15,
  },
});

export default MultiSelectDropdown;
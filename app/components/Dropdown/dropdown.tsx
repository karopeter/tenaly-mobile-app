import React, { useState } from "react";
import { 
    View,
    Text,
    TouchableOpacity,
    Modal,
    FlatList,
    StyleSheet
} from 'react-native';

interface Option {
    label: string;
    value: string;
}

interface DropdownProps {
    label: string;
    options: Option[];
    selectedValue: string | null;
    onValueChange: (value: string) => void;
    error?: string;
}


export const Dropdown: React.FC<DropdownProps> = ({
  label,
  options,
  selectedValue,
  onValueChange,
  error,
}) => {
 const [isVisible, setIsVisible] = useState(false);

  // Finding the label for the currently selected value 
  const selectedLabel = 
     options.find((opt) => opt.value === selectedValue)?.label ||
     'Select an option';

  return (
    <View className="mb-4">
       <Text  
         style={styles.labelText}
       className="text-[#525252] text-[14px] font-[500] mb-2">{label}</Text>

       {/* Dropdown Trigger */}
       <TouchableOpacity
         style={[styles.input, error ? styles.inputError : null]}
         onPress={() => setIsVisible(true)}
         activeOpacity={0.7}
       >
        <Text className="text-[#1F2937]">{selectedLabel}</Text>
       </TouchableOpacity>
       {/* Modal with Options */}
        <Modal visible={isVisible} transparent animationType="fade">
          <View className="flex-1 justify-center bg-black/50 px-4">
            <View className="bg-white mx-6 rounded-xl overflow-hidden">
              <FlatList
                 data={options}
                 keyExtractor={(item) => item.value}
                 renderItem={({ item }) => (
                  <TouchableOpacity
                    className={`p-4 border-b border-gray-200 ${
                        selectedValue === item.value ? 'bg-blue-50' : ''
                    }`}
                    onPress={() => {
                      onValueChange(item.value);
                      setIsVisible(false);
                    }}
                  >
                   <Text
                     className={`${
                       selectedValue === item.value ? 'text-blue-700 font-bold' : 'text-gray-800'
                     }`}
                    >
                    {item.label}
                   </Text>
                  </TouchableOpacity>
                 )}
              />
              <TouchableOpacity
                className="p-4 bg-gray-100"
                onPress={() => setIsVisible(false)}>
                 <Text className="text-center">Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
    </View>
  )
};

const styles = StyleSheet.create({
  input:{
  borderWidth: 1,
  borderColor: '#D1D5DB',
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 12,
  backgroundColor: '#FFFFFF'
  },
  inputError: {
    borderColor: '#EF4444'
  },
  labelText: {
    fontFamily: 'WorkSans_600SemiBold'
  }
});
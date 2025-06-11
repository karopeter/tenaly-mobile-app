import React from 'react';
import { View, Text } from 'react-native';

const DividerWithText = ({ text }: { text: string}) => {
    return (
      <View className="flex flex-row items-center">
        <View className="flex-1  border border-[#CDCDD7]" style={{ height: 1, }} />
        <Text className="text-[#868686] font-[400] text-[14px]">{text}</Text>
        <View className="flex-1  border border-[#CDCDD7]" style={{ height: 1 }} />
      </View>
    );
}

export default DividerWithText;
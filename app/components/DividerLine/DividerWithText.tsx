import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DividerWithText = ({ text }: { text: string}) => {
    return (
      <View className="flex flex-row mt-4 items-center">
        <View className="flex-1  border border-[#CDCDD7]" style={{ height: 1, }} />
        <Text style={styles.withText} className="text-[#868686] font-[400] text-[14px]">{text}</Text>
        <View className="flex-1  border border-[#CDCDD7]" style={{ height: 1 }} />
      </View>
    );
};

const styles = StyleSheet.create({
  withText: {
    fontFamily: 'WorkSans_400Regular'
  }
})

export default DividerWithText;
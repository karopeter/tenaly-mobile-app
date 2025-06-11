import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';

export type TabButtonType = {
  title: string;
};

type TabButtonsProps = {
  buttons: TabButtonType[];
  selectedTab: number;
  setSelectedTab: (index: number) => void;
};

const TabButtons = ({ buttons, selectedTab, setSelectedTab }: TabButtonsProps) => {
  return (
    <View
      accessibilityRole="tablist"
      style={{
        marginHorizontal: 2,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {buttons.map((button, index) => {
          const isSelected = selectedTab === index;

          return (
            <Pressable
              key={index}
              onPress={() => setSelectedTab(index)}
              style={{
                flex: 1,
                height: 32,
                borderRadius: 4,
                backgroundColor: isSelected ? '#EDEDED' : 'transparent',
                borderWidth: isSelected ? 0 : 1,
                borderColor: '#EDEDED',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              accessibilityRole="tab"
              accessibilityState={{ selected: isSelected }}
            >
              <Text
                style={{
                  color: '#525252',
                  fontWeight: isSelected ? '500' : '400',
                  fontSize: 14,
                }}
              >
                {button.title}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

export default TabButtons;
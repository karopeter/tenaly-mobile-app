import React from 'react';
import { 
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { useTierStore } from '../store/tier.store';
import { colors } from '../constants/theme';

interface TierTabsProps {
    currentLevel: number;
}

const TierTabs: React.FC<TierTabsProps> = ({ currentLevel }) => {
    const { selectedTier, setSelectedTier } = useTierStore();

    const tabs = [
     { id: 1 as const, label: 'Tier 1' },
     { id: 2 as const, label: 'Tier 2' },
     { id: 3 as const, label: 'Tier 3' },
     { id: 4 as const, label: 'Tier 4' },
    ];

  return (
   <View style={styles.container}>
    {tabs.map((tab) => (
     <TouchableOpacity
      key={tab.id}
      style={[
        styles.tab,
        selectedTier === tab.id && styles.activeTab,
      ]}
      onPress={() => setSelectedTier(tab.id)}
     >
      <Text
       style={[
         styles.tabText,
         selectedTier === tab.id && styles.activeTabText
       ]}
      >
       {tab.label}
      </Text>
     </TouchableOpacity>
    ))}
   </View>
  );
};

const styles = StyleSheet.create({
  container: {
   flexDirection: 'row',
   paddingHorizontal: 20,
   paddingVertical: 15,
   borderRadius: 8,
   gap: 10,
  },
  tab: {
   flex: 1,
   paddingVertical: 10,
   paddingHorizontal: 18,
   borderRadius: 8,
   alignItems: 'center'
  },
  activeTab: {
   backgroundColor: colors.blue,
  },
  tabText: {
   fontSize: 14,
   fontWeight: '500',
   color: colors.darkGray,
   fontFamily: 'WorkSans_500Medium'
  },
  activeTabText: {
    color: colors.bg,
    fontWeight: '500',
    fontFamily: 'WorkSans_500Medium'
  }
});

export default TierTabs;
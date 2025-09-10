import React from 'react';
import { 
 View,
 Text,
 Image,
 StyleSheet,
 TouchableOpacity
} from 'react-native';
import { colors } from '../constants/theme';

interface SearchBarProps {
    onPress?: () => void;
    placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
    onPress,
    placeholder = "Search for anything"
}) => {
   return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.searchBar} onPress={onPress}>
        <Image 
          source={require('../../assets/images/search-normal.png')}
          style={styles.searchIcon}
        />
        <Text style={styles.placeholder}>{placeholder}</Text>
      </TouchableOpacity>
    </View>
   );
};

const styles = StyleSheet.create({
    container: {
     paddingHorizontal: 20,
     paddingVertical: 15,
    },
    searchBar: {
     flexDirection: 'row',
     alignItems: 'center',
     backgroundColor: colors.offWhite,
     paddingHorizontal: 15,
     paddingVertical: 12,
     borderRadius: 8,
    },
    searchIcon: {
      marginRight: 10,
      fontSize: 16,
      width: 18,
      height: 18,
    },
    placeholder: {
      color: colors.ashGrey,
      fontSize: 16
    },
});

export default SearchBar;
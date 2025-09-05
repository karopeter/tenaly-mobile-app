import { View, Text, StyleSheet } from 'react-native';


export default function Bookmarked() {
    return ( 
      <View style={styles.container}>
        <Text>Bookmarked screen</Text>
      </View>
    );
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
    }
})
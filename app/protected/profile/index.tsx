import {ScrollView, View, Text, StyleSheet } from 'react-native';


export default function ProfileScreen() {

    return (
     <ScrollView style={styles.container}>
          <View>
        <Text>Profile Screen</Text>
      </View>
     </ScrollView>
    );
}


const styles = StyleSheet.create({
 container: {
    flex: 1
 }
});
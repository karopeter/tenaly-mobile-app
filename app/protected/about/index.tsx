import { View, Text, StyleSheet } from "react-native";


export default function About() {
    return (
      <View style={styles.container}>
        <Text>About Us</Text>
      </View>
    );
}


const styles = StyleSheet.create({
    container: {
       flex: 1,
    }
})
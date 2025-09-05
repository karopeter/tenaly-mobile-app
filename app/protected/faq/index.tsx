import { View, Text, StyleSheet } from "react-native";


export default function FrequentlyAskedQuestion() {
    return (
      <View style={styles.container}>
        <Text>Frequently Asked Questions</Text>
      </View>
    );
}


const styles = StyleSheet.create({
    container: {
       flex: 1,
    }
})
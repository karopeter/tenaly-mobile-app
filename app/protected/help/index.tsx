import { View, Text, StyleSheet } from "react-native";


export default function Help() {
    return (
      <View style={styles.container}>
        <Text>Help</Text>
      </View>
    );
}


const styles = StyleSheet.create({
    container: {
       flex: 1,
    }
})
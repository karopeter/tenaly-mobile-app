import { View, Text, StyleSheet } from "react-native";


export default function CustomerReviews() {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center'}}>Customer Reviews</Text>
      </View>
    );
}


const styles = StyleSheet.create({
    container: {
       flex: 1,
       justifyContent: 'center'
    }
})
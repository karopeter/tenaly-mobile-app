import { View, Text, StyleSheet } from 'react-native';


export default function AccountSettings() {
    return (
     <View style={styles.container}>
        <Text>Account Settings</Text>
     </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
})
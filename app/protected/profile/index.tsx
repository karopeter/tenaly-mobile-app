import {
  ScrollView, 
  View, 
  Text, 
  StyleSheet,
  TouchableOpacity
 } from 'react-native';
 import { SafeAreaView } from 'react-native-safe-area-context';
 import { useRouter } from 'expo-router';
 import { Ionicons } from '@expo/vector-icons';
 import { colors } from '@/app/constants/theme';


export default function ProfileScreen() {
  const router = useRouter();

    return (
     <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
         <TouchableOpacity
           onPress={() => router.back()}
           style={styles.backButton}
           hitSlop={{ top: 10, bottom: 10, left: 10, right: 10}}
         >
            <Ionicons name="arrow-back" size={22} color={colors.darkGray} />
         </TouchableOpacity>
         <Text style={styles.headerTitle}>Profile</Text>

         {/* spacer to keep title centered */ }
         <View style={styles.headerSpacer} />
      </View>
       <ScrollView style={styles.container}>
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.item}
          onPress={() => router.push('/protected/profile/personal-profile')}>
            <Text style={styles.itemText}>Personal Profile</Text>
            <Ionicons name="chevron-forward" size={20} color="#888" />
        </TouchableOpacity>

        <TouchableOpacity
           style={styles.item}
           onPress={() => router.push('/protected/profile/business-profile')}
         >
           <Text style={styles.itemText}>Business Profile</Text>
           <Ionicons name="chevron-forward" size={20} color="#888" />
        </TouchableOpacity>
      </View>
     </ScrollView>
     </SafeAreaView>
    );
}


const styles = StyleSheet.create({
  safeArea: {
   flex: 1,
   backgroundColor: colors.setGrey
  },
  header: {
   height: 56,
   flexDirection: 'row',
   alignItems: 'center',
   paddingHorizontal: 12,
   borderBottomWidth: 1,
   borderBottomColor: colors.border,
   backgroundColor: '#F8F8F8',
   shadowColor: '#4D485F1A',
   shadowOffset: {
    width: 0,
    height: 2,
   },
  },
  backButton: {
     width: 40,
     justifyContent: 'center',
     alignItems: 'flex-start'
  },
  headerTitle: {
    color: colors.darkGray,
    fontSize: 18,
    fontWeight: '600'
  },
  headerSpacer: {
   width: 40, 
  },
 container: {
    flex: 1,
 },
 section: {
  marginTop: 10,
  borderRadius: 8,
  overflow: 'hidden',
  marginHorizontal: 8,
  borderWidth: 1,
  borderColor: colors.border,
 },
 item: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: 'center',
  paddingVertical: 15,
  paddingHorizontal: 15,
  borderBottomWidth: 1,
  borderBottomColor: colors.lightSpot
 },
 itemText: {
   fontSize: 16,
   color: colors.darkGray,
   fontWeight: '500'
 }
});
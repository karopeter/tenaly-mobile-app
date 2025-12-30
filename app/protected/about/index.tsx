import React from 'react';
import {
 View, 
 Text, 
 StyleSheet,
 ScrollView,
 TouchableOpacity,
 Image,
 Platform,
 StatusBar,
 Linking
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { AntDesign, Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { colors } from '@/app/constants/theme';


export default function About() {
  const router = useRouter();

  // Social Media handlers 
  const handleSocialPress = (Platform: string) => {
    const urls: Record<string, string> = {
      facebook: 'https://facebook.com/tenaly',
      tiktok: 'https://tiktok.com/@tenaly',
      instagram: 'https://instagram.com/tenaly',
      twitter: 'https://twitter.com/tenaly'
    };

    const url = urls[Platform];
    if (url) {
      Linking.openURL(url).catch((err) => 
        console.error('Failed to open URL:', err)
      );
    };
  }

   // Contact handlers 
    const handlePhonePress = (phoneNumber: string) => {
      Linking.openURL(`tel:${phoneNumber}`);
    };

    const handleEmailPress = () => {
      Linking.openURL('mailto:support@tenaly.com');
    };

    const handleAddressPress = () => {
      // Can links to maps if needed 
      console.log('Address pressed');
    };

    // Navigation handlers 
    const handleTermsPress = () => {
      // Navigate to Terms and Conditions 
      console.log('Terms Pressed');
    };

    const handlePrivacyPress = () => {
      console.log('Privacy Pressed');
    };


return (
   <View style={styles.container}>
     <View style={styles.header}>
      <View style={styles.headerContainer}>
       <TouchableOpacity onPress={() => router.back()}>
         <AntDesign name="arrow-left" size={24} color={colors.darkGray} />
       </TouchableOpacity>
      <Text style={styles.headerTitle}>
       About Us
      </Text>
      </View>
      </View>

      <ScrollView
       style={styles.scrollView}
       contentContainerStyle={styles.scrollContent}
       showsVerticalScrollIndicator={false}
      >
       {/* Logo Section */}
       <View style={styles.logoSection}>
         <View style={styles.logoContainer}>
           <Image source={require('../../../assets/images/about-logo.png')} style={{ width: 179.89, height: 88, }} />
           <Text style={styles.version}>V1.1</Text>
         </View>
       </View>

       {/* Links Section */}
       <View style={styles.linksSection}>
        <TouchableOpacity
         style={styles.linkItem}
         onPress={handleTermsPress}
        >
         <Text style={styles.linkText}>Terms and Conditions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkItem}
          onPress={handlePrivacyPress}
        >
           <Text style={styles.linkText}>Privacy Policy</Text>
        </TouchableOpacity>

             {/* Social Media Section */}
       <View style={styles.socialSection}>
         <Text style={styles.socialTitle}>
           Follow us on our social platforms 
         </Text>
         <View style={styles.socialIconsContainer}>
           <TouchableOpacity
             style={styles.socialIconWrapper}
             onPress={() => handleSocialPress('facebook')}
           >
            <View style={styles.socialIcon}>
              <View style={styles.iconRow}>
                 <Image 
                source={require('../../../assets/images/facebook-icon.png')} 
                style={{ width: 22.04, height: 22.04}} />
                <Text style={styles.iconText}>Facebook</Text>
              </View>
               <View style={styles.iconRow}>
                 <Image 
                source={require('../../../assets/images/tiktok-icon.png')} 
                style={{ width: 22.04, height: 22.04}} />
                <Text style={styles.iconText}>Tiktok</Text>
              </View>
               <View style={styles.iconRow}>
                 <Image 
                source={require('../../../assets/images/instagram-icon.png')} 
                style={{ width: 22.04, height: 22.04}} />
                <Text style={styles.iconText}>Instagram</Text>
              </View>
               <View style={styles.iconRow}>
                 <Image 
                source={require('../../../assets/images/twitter-icon.png')} 
                style={{ width: 22.04, height: 22.04}} />
                <Text style={styles.iconText}>Twitter</Text>
              </View>
            </View>
           </TouchableOpacity>
         </View>
       </View>
       </View>

         {/* Contact Us Section */}
       <View style={styles.contactImageWrapper}>
        <Image 
          source={require('../../../assets/images/contact-us.png')}
          style={styles.contactImage}
          resizeMode='contain'
        />
       </View>
      </ScrollView>
    </View>
    );
}


const styles = StyleSheet.create({
  container: {
  flex: 1,
      backgroundColor: colors.bgTheme,
  },
  header: {
   paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 50,
    backgroundColor: colors.bg,
    shadowColor: '#4D485F1A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 6,
  },
  headerContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'WorkSans_600SemiBold',
    color: colors.darkGray,
    flex: 1,
  },
  backButton: {
    padding: 4,
  },
  headerPlaceholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },

  // Logo Section
  logoSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  version: {
    fontSize: 14,
    color: colors.darkShadeBlack,
    fontWeight: '400',
    fontFamily: 'WorkSans_400Regular'
  },

  // Links Section
  linksSection: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    marginTop: 1,
  },
  linkItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDED',
  },
  linkText: {
    fontSize: 14,
    color: colors.darkGray,
    fontWeight: '400',
    fontFamily: 'WorkSans_400Regular'
  },

  // Social Media Section
  socialSection: {
    marginTop: 10,
  },
  socialTitle: {
    fontSize: 14,
    color: colors.darkShadeBlack,
    marginBottom: 20,
    fontWeight: '500',
    fontFamily: 'WorkSans_500Medium',
    textAlign: 'left',
  },
  socialIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  socialIconWrapper: {
    alignItems: 'center',
    gap: 8,
  },
  socialIcon: {
    flexDirection: 'row',
    gap: 15,
    justifyContent: 'flex-start',
  },
  iconRow: {
    flexDirection: 'column',
    alignItems: 'center',
     marginBottom: 10,
  },
  iconText: {
  color: '#74787F',
  fontSize: 14,
  fontWeight: '400',
  marginTop: 10,
  fontFamily: 'WorkSans_400Regular'
  },
  socialLabel: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '400',
  },

  // Contact Section
  contactSection: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: '#8989E9',
    padding: 20,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  contactCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactTextContainer: {
    flex: 1,
    gap: 4,
  },
  contactText: {
    fontSize: 15,
    color: '#333333',
    fontWeight: '400',
  },
  contactImageWrapper: {
  marginHorizontal: 16,  
  marginTop: 16,
},
contactImage: {
  width: '100%',
  height: undefined,
  aspectRatio: 1,  // Adjust based on your image ratio
},
});
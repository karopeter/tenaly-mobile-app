import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5, Entypo } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import apiClient from "../../utils/apiClient";
import { useAuth } from "../../context/AuthContext";
import { showErrorToast } from '@/app/utils/toast';
import { colors } from '@/app/constants/theme';

const menuItems = [
  { title: "Profile", icon: <Ionicons name="person-outline" size={20} color="#525252" />, route: "/protected/profile" },
  { title: "Analytics", icon: <MaterialIcons name="analytics" size={20} color="#525252" />, route: "/protected/analytics" },
  { title: "Account Settings", icon: <Ionicons name="settings-outline" size={20} color="#525252" />, route: "/protected/account-settings" },
  { title: "Bookmarked", icon: <FontAwesome5 name="bookmark" size={18} color="#525252" />, route: "/protected/bookmarked" },
  { title: "Customer Reviews", icon: <Ionicons name="chatbubble-ellipses-outline" size={20} color="#525252" />, route: "/protected/reviews" },
  { title: "Premium Service", icon: <FontAwesome5 name="crown" size={18} color="#525252" />, route: "/protected/premium" },
  { title: "Help", icon: <Ionicons name="help-circle-outline" size={20} color="#525252" />, route: "/protected/help" },
  { title: "Frequently Asked Questions", icon: <MaterialIcons name="question-answer" size={20} color="#525252" />, route: "/protected/faq" },
  { title: "About", icon: <Entypo name="globe" size={20} color="#525252" />, route: "/protected/about" },
  { title: "Become Verified", icon: <MaterialIcons name="verified" size={20} color="#1031AA" />, route: "/protected/become-verified" },
];

const PLACEHOLDER_IMAGE = require('../../../assets/images/profile-circle.png');

export default function SettingsScreen() {
  const router = useRouter();
  const { user: authUser, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!apiClient) {
         showErrorToast('API client not initialized.');
         return;
        }
        const response = await apiClient.get('/api/profile');
        setProfile(response.data);
      } catch(error) {
        console.error("Failed to fetch profile:", error);
      } finally  {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
         <Text style={styles.header}>Settings</Text>
         <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.blue} />
          <Text style={styles.loadingText}>Loading profile...</Text>
         </View>
      </View>
    );
  }

  const fullName = profile?.fullName || authUser?.fullName || 'User';
  const email = profile?.email || authUser?.email || 'No email';
 // const imageUri = profile?.image;
  const imageUri =
    profile?.image && profile.image.trim() !== "" ? profile.image : null;
  const planType = profile?.paidPlans?.[0]?.planType || 'free';
  const isPremium = planType !== 'free' && planType !== null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>Settings</Text>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileRow}>
          {/* <Image 
            source={imageUri ? { uri: imageUri } : PLACEHOLDER_IMAGE }
            style={styles.profileImage}
            resizeMode="cover"
            defaultSource={PLACEHOLDER_IMAGE}
          /> */}

          <Image
            source={
            !imageUri || imageError
             ? PLACEHOLDER_IMAGE
             : { uri: imageUri }
             }
            style={styles.profileImage}
            resizeMode="cover"
            onError={() => setImageError(true)}
            />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{fullName}</Text>
            <Text style={styles.profileEmail}>{email}</Text>
          </View>
        </View>

        {/* Separator */}
        <View style={styles.separator} />

        {/* Free Plan Row */}
        <View style={styles.freePlanContainer}>
          <FontAwesome5 name={isPremium ? "crown" : "user"} size={14} color={isPremium ? "#f5a623" : "#868686"} />
          <Text style={styles.freePlanText}>
            {isPremium ? `You are on ${planType} plan` : 'You are on free plan'}
          </Text>
        </View>
      </View>

      {/* Scrollable Menu Items */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              activeOpacity={0.6}
              onPress={() => router.push(item.route)}
            >
              <View style={styles.menuLeft}>
                {item.icon}
                <Text style={styles.menuText}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.darkGray} />
            </TouchableOpacity>
          ))}

          {/* Logout Item */}
          <TouchableOpacity
            style={styles.logoutItem}
            activeOpacity={0.6}
            onPress={signOut}>
             <View style={styles.menuLeft}>
              <Ionicons name="log-out-outline" size={20} color="red" />
               <Text style={[styles.menuText, { color: "red" }]}>Logout</Text>
             </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.setGrey,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "500",
    marginBottom: 16,
    color: colors.darkGray,
    marginTop: 40,
  },
  loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.darkGray
  },
  profileCard: {
    backgroundColor: colors.greyBlue,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  profileImage: {
    width: 55,
    height: 55,
    borderRadius: 28,
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.darkGray,
    fontFamily: 'WorkSans_600SemiBold'
  },
  profileEmail: {
    fontSize: 14,
    color: colors.lightGrey,
    fontWeight: "400",
    fontFamily: 'WorkSans_500Medium'
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: colors.greyBlue300,
    marginVertical: 8,
  },
  freePlanContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  freePlanText: {
    fontSize: 12,
    color: colors.darkGray,
    fontWeight: "500",
    marginLeft: 6,
    fontFamily: 'WorkSans_500Medium'
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  menuContainer: {
    flexGrow: 1,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.blueRomance,
  },
  logoutItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  menuText: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: 'WorkSans_500Medium',
    color: colors.darkGray
  },
});
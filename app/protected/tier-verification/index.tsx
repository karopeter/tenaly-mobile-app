import React, { useEffect, useState }  from "react";
import {  
 View,
 Text,
 TouchableOpacity,
 StyleSheet,
 ActivityIndicator,
 StatusBar,
 ScrollView
 } from "react-native";
 import { AntDesign } from "@expo/vector-icons";
 import { SafeAreaView } from "react-native-safe-area-context";
 import { useRouter } from "expo-router";
 import { colors } from "@/app/constants/theme";
 import { useTierStatus, useBusinesses } from "@/app/hook/tier";
 import { useTierStore } from "@/app/store/tier.store";
 import TierTabs from "@/app/reusables/TierTabs";
 import CurrentLevelBadge from "@/app/reusables/CurrentLevelBadge";
 import Tier1Content from "@/app/components/TierContent/Tier1Content";
 import Tier2Content from "@/app/components/TierContent/Tier2Content";
 import Tier3Content from "@/app/components/TierContent/Tier3Content";
 import Tier4Content from "@/app/components/TierContent/Tier4Content";


 const TierVerification: React.FC = () => {
    const router = useRouter();
    const [showTier4Modal, setShowTier4Modal] = useState(false);
    const { selectedTier } = useTierStore();

    const { data: tierStatus, isLoading: isLoadingTier } = useTierStatus();
    const { data: businesses = [], isLoading: isLoadingBusinesses } = useBusinesses();

    const loading = isLoadingTier || isLoadingBusinesses;

    const tier4Unlocked = tierStatus?.tier4Unlocked || false;

    useEffect(() => {
      if (tierStatus?.tier4Unlocked) {
        setShowTier4Modal(true);
      }
    }, [tierStatus?.tier4Unlocked]);

    // Add Modal Jsx (modal with Tier 4 Badge,  crown, "Congratulations" text, Download + Share buttons coming soon)

      // Loading state
      if (loading) {
        return (
          <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1031AA" />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          </SafeAreaView>
        );
      }

      const currentLevel = tierStatus?.currentLevel || 0;
      const tier1 = tierStatus?.tier1 || null;
      const tier2 = tierStatus?.tier2 || null;
      const tier3 = tierStatus?.tier3 || null;

      const renderContent = () => {
        switch (selectedTier) {
            case 1: 
               return <Tier1Content tier1={tier1} />;
            case 2: 
              return <Tier2Content tier1={tier1} tier2={tier2} />;
            case 3: 
              return (
                 <Tier3Content
                    tier2={tier2}
                    tier3={tier3}
                    businesses={businesses}
                    currentLevel={currentLevel}
                 />
              );
            case 4:
             return <Tier4Content currentLevel={currentLevel} tier4Unlocked={tier4Unlocked} />;
            default: 
             return null;
        }
      };


    return (
      <SafeAreaView style={styles.container}>
       <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />

       {/* Header */}
       <View style={styles.header}>
         <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
           <AntDesign name="arrow-left" size={20} color={colors.darkGray} />
         </TouchableOpacity>
         <Text style={styles.headerTitle}>
            Tier Verification
         </Text>
       </View>

       {/* TIer Tabs */}
       <TierTabs currentLevel={currentLevel} />

       {/* Current Level Badge */}
       {currentLevel > 0 && <CurrentLevelBadge currentLevel={currentLevel} />}

       {/* Tier Content */}
       <ScrollView
         style={styles.content}
         showsVerticalScrollIndicator={false}
         contentContainerStyle={styles.contentContainer}
       >
         {renderContent()}
       </ScrollView>
      </SafeAreaView>
    )
 }

 const styles = StyleSheet.create({
   container: {
    flex: 1,
    backgroundColor: colors.bgTheme,
   },
   loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
   },
   loadingText: {
     marginTop: 10,
     fontSize: 16,
     color: colors.lightGray,
     fontWeight: '500',
     fontFamily: 'WorkSans_500Medium'
   },
   header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: colors.bg,
    shadowColor: colors.blueGrey,
    paddingTop: 30,
    paddingBottom: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    elevation: 6
   },
   backButton: {
    marginRight: 15,
   },
   headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.darkGray,
    fontFamily: 'WorkSans_600SemiBold',
    flex: 1,
   },
    content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
 });

 export default TierVerification;
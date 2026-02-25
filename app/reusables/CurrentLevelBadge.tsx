import React from 'react';
import {
 View,
 Text,
 ImageBackground,
 StyleSheet
 } from 'react-native';
 import { colors } from '../constants/theme';

 interface CurrentLevelBadgeProps {
    currentLevel: number;
 }


 const CurrentLevelBadge: React.FC<CurrentLevelBadgeProps> = ({
   currentLevel }) => {
    return (
      <ImageBackground
        source={require('../../assets/images/full-tier-bg.png')}
        style={styles.container}
        imageStyle={styles.backgroundImage}
        resizeMode='cover'
      >
        <Text style={styles.label}>Current Level</Text>
        <ImageBackground
          source={require('../../assets/images/tier-bg.png')}
          style={styles.badge}
          imageStyle={{ borderRadius: 20 }}
          resizeMode='cover'
        >
         <Text style={styles.badgeText}>Tier {currentLevel}</Text>
        </ImageBackground>
      </ImageBackground>
    );
};

const styles = StyleSheet.create({
  container: {
   flexDirection: 'row',
   alignItems: 'center',
   justifyContent: 'space-between',
   width: 361,
   height: 77,
   paddingTop: 16,
   paddingBottom: 16,
   paddingLeft: 10,
   paddingRight: 16,
   marginHorizontal: 20,
   marginTop: 15,
   borderRadius: 8,
   overflow: 'hidden'
  },
  backgroundImage: {

  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.bg,
    fontFamily: 'WorkSans_500Medium'
  },
  badge: {
   paddingVertical: 8,
   paddingHorizontal: 20,
   borderRadius: 20,
   overflow: 'hidden',
  },
  badgeText: {
     fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    fontFamily: 'WorkSans_600SemiBold',
  }
});

export default CurrentLevelBadge;
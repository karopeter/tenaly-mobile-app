import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/app/constants/theme';

interface VerificationStatusScreenProps {
  isVerified: boolean;
  onDone: () => void;
}

const VerificationStatusScreen: React.FC<VerificationStatusScreenProps> = ({
  isVerified,
  onDone,
}) => {
  if (isVerified) {
    // Fully Verified State
    return (
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Image
            source={require('../../assets/images/verifiedImg.png')}
            style={styles.icon}
          />
        </View>
        <Text style={styles.text}>
          Congratulations, you are now a verified user of Tenaly
        </Text>
        <TouchableOpacity onPress={onDone}>
          <LinearGradient
            colors={['#00A8DF', '#1031AA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Done</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  // Pending Verification State
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Image
          source={require('../../assets/images/pending-img.png')}
          style={styles.icon}
        />
      </View>
      <View style={styles.pendingContainer}>
        <Text style={styles.statusLabel}>Verification status:</Text>
        <View style={styles.pendingBadge}>
          <Text style={styles.pendingText}>Pending</Text>
        </View>
      </View>
      <Text style={styles.pendingDescription}>
        Our team is reviewing your information and will get back to you shortly.
        Thank you for your patience!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 20,
  },
  icon: {
    width: 63.33,
    height: 66.67,
  },
  text: {
    fontSize: 20,
    color: colors.darkGray,
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: '500',
    fontFamily: 'WorkSans_500Medium',
    lineHeight: 26,
  },
  button: {
    paddingHorizontal: 100,
    paddingVertical: 18,
    borderRadius: 8,
  },
  buttonText: {
    color: colors.bg,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'WorkSans_500Medium',
  },
  pendingContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  statusLabel: {
    fontSize: 16,
    color: colors.darkGray,
    fontWeight: '500',
    fontFamily: 'WorkSans_500Medium',
  },
  pendingBadge: {
    backgroundColor: colors.yellow600,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 28,
  },
  pendingText: {
    color: colors.whiteShade,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'WorkSans_500Medium',
  },
  pendingDescription: {
    fontSize: 16,
    color: colors.darkGray,
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: 'WorkSans_500Medium',
    lineHeight: 24,
  },
});

export default VerificationStatusScreen;
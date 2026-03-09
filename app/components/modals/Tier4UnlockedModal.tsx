import React, { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Share,
} from "react-native";
import { Feather } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

interface Tier4UnlockedModalProps {
  visible: boolean;
  onClose: () => void;
}

const Tier4UnlockedModal: React.FC<Tier4UnlockedModalProps> = ({
  visible,
  onClose,
}) => {
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.82)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const crownY = useRef(new Animated.Value(-16)).current;
  const crownOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      backdropOpacity.setValue(0);
      cardScale.setValue(0.82);
      cardOpacity.setValue(0);
      crownY.setValue(-16);
      crownOpacity.setValue(0);

      Animated.sequence([
        Animated.parallel([
          Animated.timing(backdropOpacity, {
            toValue: 1,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.spring(cardScale, {
            toValue: 1,
            tension: 65,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.timing(cardOpacity, {
            toValue: 1,
            duration: 220,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.spring(crownY, {
            toValue: 0,
            tension: 80,
            friction: 5,
            useNativeDriver: true,
          }),
          Animated.timing(crownOpacity, {
            toValue: 1,
            duration: 280,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [visible, backdropOpacity, cardOpacity, cardScale, crownOpacity, crownY]);

  const handleShare = async () => {
    try {
      await Share.share({
        message:
          "🎉 I just unlocked Elite Seller (Tier 4) status on Tenaly! My consistent performance earned me this achievement.",
        title: "Elite Seller Status Unlocked!",
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownload = () => {
    // TODO: implement badge/certificate download
    console.log("Download badge");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        {/* Dismiss on backdrop tap */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />

        <Animated.View
          style={[
            styles.card,
            { opacity: cardOpacity, transform: [{ scale: cardScale }] },
          ]}
        >
          {/* Close */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Feather name="x" size={17} color="#9A9AB0" />
          </TouchableOpacity>

          {/* Badge + Crown */}
          <View style={styles.badgeArea}>
            <View style={styles.glowBlob} />

            <Animated.Text
              style={[
                styles.crown,
                { opacity: crownOpacity, transform: [{ translateY: crownY }] },
              ]}
            >
              👑
            </Animated.Text>

            <View style={styles.tierPill}>
              <Text style={styles.tierPillText}>Tier </Text>
              <View style={styles.tierNumCircle}>
                <Text style={styles.tierNumText}>4</Text>
              </View>
            </View>
          </View>

          <Text style={styles.newBadgeLabel}>New badge unlocked</Text>

          <Text style={styles.congratsText}>
            {"Congratulations, You're now an "}
            <Text style={styles.eliteText}>Elite Seller</Text>
            {" on Tenaly"}
          </Text>

          <Text style={styles.subtitleText}>
            Your consistent performance has earned you{"\n"}Elite Seller status.
          </Text>

          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={styles.downloadBtn}
              onPress={handleDownload}
              activeOpacity={0.8}
            >
              <Feather name="download" size={15} color="#1031AA" />
              <Text style={styles.downloadText}>Download</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shareBtn}
              onPress={handleShare}
              activeOpacity={0.85}
            >
              <Feather name="share-2" size={15} color="#FFFFFF" />
              <Text style={styles.shareText}>Share</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.48)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: Math.min(width - 48, 370),
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingTop: 34,
    paddingBottom: 26,
    paddingHorizontal: 24,
    alignItems: "center",
    shadowColor: "#1031AA",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 18,
    overflow: "hidden",
  },
  closeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F3F3F8",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },

  // Badge
  badgeArea: {
    alignItems: "center",
    height: 96,
    justifyContent: "flex-end",
    width: "100%",
    marginBottom: 14,
  },
  glowBlob: {
    position: "absolute",
    width: 210,
    height: 130,
    borderRadius: 105,
    top: -4,
    backgroundColor: "rgba(190, 205, 255, 0.28)",
  },
  crown: {
    fontSize: 32,
    position: "absolute",
    top: 4,
    zIndex: 5,
  },
  tierPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 50,
    backgroundColor: "#1A3BC4",
    gap: 8,
    shadowColor: "#0A1F8F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
  tierPillText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
    fontFamily: "WorkSans_600SemiBold",
  },
  tierNumCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(188, 215, 246, 0.38)",
    justifyContent: "center",
    alignItems: "center",
  },
  tierNumText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    fontFamily: "WorkSans_700Bold",
  },

  // Text
  newBadgeLabel: {
    fontSize: 13,
    color: "#9A9AB0",
    fontFamily: "WorkSans_400Regular",
    marginBottom: 12,
  },
  congratsText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A2E",
    fontFamily: "WorkSans_700Bold",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 10,
  },
  eliteText: {
    color: "#1031AA",
    fontFamily: "WorkSans_700Bold",
  },
  subtitleText: {
    fontSize: 13,
    color: "#6B6B85",
    fontFamily: "WorkSans_400Regular",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 26,
  },

  // Buttons
  buttonsRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  downloadBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    height: 46,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#1031AA",
    backgroundColor: "#FFFFFF",
  },
  downloadText: {
    color: "#1031AA",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "WorkSans_600SemiBold",
  },
  shareBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    height: 46,
    borderRadius: 10,
    backgroundColor: "#1031AA",
  },
  shareText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "WorkSans_600SemiBold",
  },
});

export default Tier4UnlockedModal;
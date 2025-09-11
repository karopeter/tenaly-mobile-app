import React from 'react';
import {
  View, 
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StyleSheet
} from 'react-native';
import { Conversation } from '../types/message';
import { colors } from '../constants/theme';

interface ConversationItemProps {
    conversation: Conversation;
    onPress: (conversation: Conversation) => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
    conversation,
    onPress,
}) => {
  const formatTime = (dateString?: string) => {
     if (!dateString) return '';

     const date = new Date(dateString);
     const now = new Date();
     const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

     if (diffInHours < 24) {
      return date.toLocaleDateString([], { hour: '2-digit', minute: '2-digit' });
     } else { 
       return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
     }
  };

  // Get user display name 
  const getUserDisplayName = () => {
     return conversation.otherUser?.fullName || 'Unknown User';
  };

  // Get User avatar initial
  const getUserAvatar = () => {
    return conversation.otherUser?.fullName?.charAt(0)?.toUpperCase() || '?';
  }
    return (
      <TouchableOpacity
       style={styles.container}
       onPress={() => onPress(conversation)}
      >
        <View style={styles.avatarContainer}>
         {conversation.otherUser?.image ? (
            <Image
              source={{ uri: conversation.otherUser.image }}
              style={styles.avatarImage}
            />
         ): (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{getUserAvatar()}</Text>
          </View>
         )}
         {/* You can add online indicator based on user status if needed */}
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.name}>{getUserDisplayName()}</Text>
            <Text style={styles.time}>
              {formatTime(conversation.lastMessageAt)}
            </Text>
          </View>
          <Text style={styles.message} numberOfLines={1}>
             {conversation.adTitle || 'No messages yet'}
          </Text>
        </View>

        {/* You can add unread badge if the backend provides  unread count */}

        {/* {conversation.unread > 0 && (
          <View style={styles.unreadBadge}>
             <Text style={styles.unreadText}>{conversation.unread}</Text>
          </View>
        )} */}
      </TouchableOpacity>
    );
};


const styles = StyleSheet.create({
 container: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: colors.offWhite,
    borderBottomWidth: 1,
    borderBottomColor: colors.blueRomance
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatarImage: {
   width: 50,
   height: 50,
   borderRadius: 25,
   backgroundColor: colors.blueRomance
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.blueRomance,
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.blackGrey
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.indigoGreen,
    borderWidth: 2,
    borderColor: colors.bg,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkGray
  },
  time: {
    fontSize: 12,
    color: colors.darkGray,
  },
  message: {
    fontSize: 14,
    color: colors.darkGray,
  },
  unreadBadge: {
    backgroundColor: colors.skyBlue,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  unreadText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ConversationItem;
import React from 'react';
import {
  View, 
  Text,
  TouchableOpacity,
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
    return (
      <TouchableOpacity
       style={styles.container}
       onPress={() => onPress(conversation)}
      >
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>{conversation.user.avatar}</Text>
          {conversation.user.online && <View style={styles.onlineIndicator} />}
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.name}>{conversation.user.name}</Text>
            <Text style={styles.time}>{conversation.time}</Text>
          </View>
          <Text style={styles.message} numberOfLines={1}>
            {conversation.lastMessage}
          </Text>
        </View>

        {conversation.unread > 0 && (
          <View style={styles.unreadBadge}>
             <Text style={styles.unreadText}>{conversation.unread}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
};


const styles = StyleSheet.create({
 container: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    fontSize: 24,
    textAlign: 'center',
    lineHeight: 50,
    borderRadius: 25,
    backgroundColor: colors.blueRomance,
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
    color: colors.blackGrey,
  },
  time: {
    fontSize: 12,
    color: colors.ashGrey,
  },
  message: {
    fontSize: 14,
    color: colors.attachBlack,
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
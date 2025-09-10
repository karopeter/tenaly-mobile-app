import React from 'react';
import { 
    View,
    Text,
    StyleSheet,
} from 'react-native';
import { Message } from '../types/message';
import { colors } from '../constants/theme';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isMyMessage = message.sender === 'me';

  return (
    <View style={[
      styles.container,
      isMyMessage ? styles.myMessage : styles.otherMessage
    ]}>
      <Text style={[
        styles.time,
        isMyMessage ? styles.myMessageTime : styles.otherMessageTime
      ]}>
        {message.time}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 3,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end'
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  text: {
    padding: 12,
    borderRadius: 12,
    fontSize: 16,
    lineHeight: 20,
  },
  myMessagText: {
    backgroundColor: colors.skyBlue,
    color: colors.bg,
  },
  otherMessageText: {
    backgroundColor: colors.blueRomance,
    color: colors.blackGrey
  },
  time: {
    fontSize: 11,
    marginTop: 2,
    paddingHorizontal: 4,
  },
  myMessageTime: {
    color: colors.attachBlack,
    textAlign: 'right'
  },
  otherMessageTime: {
    color: colors.ashGrey,
    textAlign: 'left'
  }
});

export default MessageBubble;
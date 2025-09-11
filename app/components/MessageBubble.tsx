import React from 'react';
import { 
    View,
    Text,
    Image,
    StyleSheet,
} from 'react-native';
import { Message } from '../types/message';
import { colors } from '../constants/theme';

interface MessageBubbleProps {
  message: Message;
  currentUserId?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, currentUserId }) => {
 const isMyMessage = typeof message.from === 'string' 
       ? message.from  === currentUserId 
       : message.from._id === currentUserId;

    // Format time from ISO string or timestamp
    const formatTime = (timeString: string) => {
       const date = new Date(timeString);
       return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'});
    };

    // Render file attachment if present
    const renderFileAttachment = () => {
      if (!message.file) return null;

      const isImage = message.file.mimetype.startsWith('image/');

      if (isImage) {
        return (
          <View style={styles.imageContainer}>
            <Image 
               source={{ uri: message.file.path }}
               style={styles.messageImage}
               resizeMode="cover"
            />
          </View>
        );
      } else {
        return (
          <View style={styles.fileContainer}>
            <View style={styles.fileIcon}>
             <Text style={styles.fileIconText}>📄</Text>
            </View>
            <Text>
              {message.file.filename}
            </Text>
          </View>
        );
      }
    };

  return (
    <View style={[
       styles.container,
       isMyMessage ? styles.myMessage  : styles.otherMessage
    ]}>
      <View style={[
         styles.bubble,
         isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble
      ]}>
        {/* Render file attachment if present */}
        {renderFileAttachment()}

        {/* Render text messages if present */}
        {message.text && (
          <Text style={[
             styles.text,
             isMyMessage ? styles.myMessagText : styles.otherMessageText
          ]}>
            {message.text}
          </Text>
        )}
      </View>

      <Text  style={[
         styles.time,
         isMyMessage ? styles.myMessageTime : styles.otherMessageTime
      ]}>
        {formatTime(message.createdAt)}
      </Text>
    </View>
  )
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
  otherMessageBubble: {
        backgroundColor: colors.blueRomance,
        borderBottomLeftRadius: 4,
    },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 4
  },
  myMessageBubble: {
   backgroundColor: colors.skyBlue,
   borderBottomRightRadius: 4,
  },
  text: {
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
    paddingHorizontal: 4,
  },
  myMessageTime: {
    color: colors.attachBlack,
    textAlign: 'right'
  },
  otherMessageTime: {
    color: colors.ashGrey,
    textAlign: 'left'
  },
  imageContainer: {
    marginBottom: 4,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    marginBottom: 4,
  },
  fileIcon: {
    marginRight: 8,
  },
  fileIconText: {
     fontSize: 16,
  },
  fileName: {
    flex: 1,
    fontSize: 14,
    color: colors.blackGrey
  }
});

export default MessageBubble;
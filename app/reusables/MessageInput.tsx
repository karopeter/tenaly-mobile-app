import React, { useState } from 'react';
import {
     View,
     TextInput,
     TouchableOpacity,
     StyleSheet,
     Image,
     Alert,
     KeyboardAvoidingView,
     Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { colors } from '../constants/theme';
import { FileAttachment } from '../types/message';
import { showErrorToast } from '../utils/toast';

interface MessageInputProps {
  onSendMessage:  (message: string) => void;
  onSendFile?: (file: FileAttachment) => void;
  placeholder?: string;
  disabled?: boolean;
  onTyping?: () => void;
  onStopTyping?: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onSendFile,
  placeholder = "Type your message",
  disabled = false,
  onTyping,
  onStopTyping,
}) => {
   const [message, setMessage] = useState<string>("");
   const [typingTimer, setTypingTimer] = useState<NodeJS.Timeout | null>(null);
   //const [typingTimer, setTypingTimer] = useState<NodeJS.Timeout | null>(null);

   const handleSend = () => {
     if (message.trim()) {
        onSendMessage(message.trim());
        setMessage("");
        onStopTyping?.();
     }
   };

   const handleTextChange = (text: string) => {
     setMessage(text);

     if (text.length > 0 && onTyping) {
       onTyping();


       if (typingTimer) {
         clearTimeout(typingTimer);
       }

       const newTimer = setTimeout(() => {
         onStopTyping?.();
       }, 3000);

       //setTypingTimer(newTimer);
        setTypingTimer(newTimer as unknown as NodeJS.Timeout);
     } else if (text.length ===  0) {
        onStopTyping?.();
     }
   };

  //  const handlePickImage = async () => {
  //    try {
  //      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  //      if (status !==  'granted') {
  //       showErrorToast('Permission required, Camera roll permission is needed to select images.');
  //       return;
  //      }

  //      const result = await ImagePicker.launchImageLibraryAsync({
  //        mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //        allowsEditing: true,
  //        aspect: [4, 3],
  //        quality: 0.8,
  //      });

  //      if (!result.canceled && result.assets?.[0] && onSendFile) {
  //       const asset = result.assets[0];
  //       onSendFile({
  //         type: 'image',
  //         uri: asset.uri,
  //         name: `image_${Date.now()}.jpg`,
  //         size: asset.fileSize,
  //         mimeType: asset.type || 'image/jpeg',
  //       });
  //      }
  //    } catch (error) {
  //      console.error('Error picking image:', error);
  //      showErrorToast('Error, Failed to select image');
  //    }
  //  };


   const handlePickImage = async () => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, 
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets?.[0] && onSendFile) {
      const asset = result.assets[0];
      onSendFile({
        type: 'image',
        uri: asset.uri,
        name: `image_${Date.now()}.jpg`,
        size: asset.fileSize,
        mimeType: asset.type || 'image/jpeg',
      });
    } 
  } catch (error) {
    console.error("Error picking image:", error);
    showErrorToast('Failed to select image');
  }
};


const handlePickDocument = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/*"], 
      copyToCacheDirectory: true,
      multiple: false, 
    });

   
    if (!result.canceled && result.assets?.[0] && onSendFile) {
      const doc = result.assets[0];
      onSendFile({
        type: 'file',
        uri: doc.uri,
        name: doc.name,
        size: doc.size,
        mimeType: doc.mimeType
      });
    }
  } catch (error) {
    console.error("Error picking document:", error);
    showErrorToast('Failed to select document');
  }
};


   // Ask user: Image or File?
  const handleAttachPress = () => {
    Alert.alert(
      "Attach",
      "What would you like to send?",
      [
        { text: "Image", onPress: handlePickImage },
        { text: "File", onPress: handlePickDocument },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

   return (
     <KeyboardAvoidingView 
       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
       keyboardVerticalOffset={Platform.OS  === 'ios' ? 90 : 0}
     >
       <View style={styles.container}>
      <TouchableOpacity 
         style={styles.attachButton} 
         onPress={handleAttachPress}
         disabled={disabled}>
        <Image 
          source={require('../../assets/images/add.png')}
          style={styles.plusAdd}
        />
      </TouchableOpacity>

      <TextInput 
         style={[styles.input, disabled && styles.inputDisabled]}
         value={message}
         onChangeText={setMessage}
         placeholder={placeholder}
         placeholderTextColor="#8C8C8C"
         multiline
         maxLength={500}
         editable={!disabled}
         onSubmitEditing={handleSend}
         returnKeyType="send"
       />

       <TouchableOpacity
          style={[
             styles.sendButton, 
             (!message.trim() || disabled) && styles.sendButtonDisabled
          ]}
          onPress={handleSend}
          disabled={!message.trim() || disabled}
        >
          <Image 
           source={require('../../assets/images/send.png')}
           style={styles.sendIcon}
          />
       </TouchableOpacity>
    </View>
     </KeyboardAvoidingView>
   );
};


const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.blueRomance
  },
  attachButton: {
    marginRight: 10,
    padding: 8,
    borderRadius: 40,
    borderWidth: 1,
    width: 44,
    height: 44,
    borderColor: '#EDEDED'
  },
  plusAdd: {
    width: 24,
    height: 24,
  },
  attachIcon: {
    fontSize: 18,
    color: colors.attachBlack
  },
  input: {
    flex: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    height: 44,
    backgroundColor: colors.lightSpot,
    color: colors.blackGrey
  },
  inputDisabled: {
    backgroundColor: colors.greyDisabled,
    color: colors.ashGrey
  },
  sendButton: {
    marginLeft: 10,
    borderRadius: 20,
    padding: 10,
  },
  sendButtonDisabled: {
  },
  sendIcon: {
    width: 20,
    height: 19
  }
});

export default MessageInput;
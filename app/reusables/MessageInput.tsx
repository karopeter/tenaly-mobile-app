import React, { useState } from 'react';
import {
     View,
     TextInput,
     TouchableOpacity,
     StyleSheet,
     Image,
     Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { colors } from '../constants/theme';

interface MessageInputProps {
  onSendMessage:  (message: string | { type: 'image' | 'file'; uri: string; name?: string;}) => void,
  placeholder?: string;
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  placeholder = "Type your message",
  disabled = false,
}) => {
   const [message, setMessage] = useState<string>("");

   const handleSend = () => {
     if (message.trim()) {
        onSendMessage(message.trim());
        setMessage("");
     }
   };

   const handlePickImage = async () => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, 
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const pickedImage = result.assets[0];
      console.log("Picked image:", pickedImage.uri);
    } else {
      console.log("Image picking cancelled.");
    }
  } catch (error) {
    console.error("Error picking image:", error);
  }
};


const handlePickDocument = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/*"], 
      copyToCacheDirectory: true,
      multiple: false, 
    });

   
    if (result.canceled) {
      console.log("Document picking cancelled.");
      return;
    }

    const doc = result.assets[0];
    console.log("Picked document:", doc.uri);
    console.log("Document name:", doc.name);
    console.log("Document size:", doc.size);
  } catch (error) {
    console.error("Error picking document:", error);
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
         maxLength={200}
         editable={!disabled}
         onSubmitEditing={handleSend}
         returnKeyType="send"
       />

       <TouchableOpacity
          style={[styles.sendButton, (!message.trim() || disabled) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!message.trim() || disabled}
        >
          <Image 
           source={require('../../assets/images/send.png')}
           style={styles.sendIcon}
          />
       </TouchableOpacity>
    </View>
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
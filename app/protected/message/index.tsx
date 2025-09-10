import React, { useCallback, useState } from 'react';
import { 
  View, 
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  KeyboardAvoidingView,
  Platform
  } from 'react-native';
import MessageInput from '@/app/reusables/MessageInput';
import ConversationItem from '@/app/reusables/conversationItem';
import MessageBubble from '@/app/components/MessageBubble';
import SearchBar from '@/app/components/SearchBar';
import { conversations, chatMessages } from '@/app/data/mockData';
import { Conversation, Message, ScreenType } from '@/app/types/message';
import { colors } from '@/app/constants/theme';


export default function MessageScreen() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('empty');
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>(chatMessages);

 const handleSendMessage = useCallback((messageText: string) => {
   const newMessage: Message = {
     id: messages.length + 1,
     text: messageText,
     sender: 'me',
     time: new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
     }).toLowerCase(),
   };

   setMessages(prev => [...prev, newMessage]);
 }, [messages.length]);

 const handleConversationPress = useCallback((conversation: Conversation) => {
   setSelectedChat(conversation);
   setCurrentScreen('chat');
 }, []);

 const renderEmptyState = () => (
   <SafeAreaView style={styles.container}>
     <StatusBar barStyle="dark-content" backgroundColor="white" />

     <View style={styles.header}>
       <Text style={styles.headerText}>Message</Text>
     </View>

     <SearchBar />

     <View style={styles.emptyState}>
       <View style={styles.emptyIcon}>
          <Image
             source={require('../../../assets/images/emptyMessage.png')}
             style={styles.emptyIcon}
          />
       </View>
       <Text style={styles.emptyText}>No messages yet</Text>
       <TouchableOpacity
         style={styles.linkButton}
         onPress={() => setCurrentScreen('list')}>
          <Text style={styles.linkText}>lottie file link</Text>
       </TouchableOpacity>
     </View>
   </SafeAreaView>
 );

 const renderMessageList = () => (
   <KeyboardAvoidingView 
     style={styles.container}
     behavior={Platform.OS === "ios" ? "padding" : "height"}
     keyboardVerticalOffset={90}>
     <StatusBar barStyle="dark-content" backgroundColor="white" />

     <View style={styles.header}>
       <Text>Message</Text>
     </View>

     <SearchBar />

     <FlatList
       data={conversations}
       keyExtractor={(item) => item.id.toString()}
       renderItem={({ item }) => (
        <ConversationItem
          conversation={item}
          onPress={handleConversationPress}
        />
       )}
       style={styles.conversationList}
       showsVerticalScrollIndicator={false}
     />
   </KeyboardAvoidingView>
 );

 const renderChatScreen = () => (
    <KeyboardAvoidingView
       style={styles.container}
       behavior={Platform.OS === "ios" ? "padding" : "height"}
       keyboardVerticalOffset={90}
     >
        <SafeAreaView style={styles.container}>
     <StatusBar barStyle="dark-content" backgroundColor="white" />

     <View style={styles.chatHeader}>
       <TouchableOpacity onPress={() => setCurrentScreen('list')}>
         <Image 
          source={require('../../../assets/images/arrow-left.png')}
          style={styles.backButton}
         />
       </TouchableOpacity>
       <View style={styles.chatHeaderContent}>
         <View style={styles.chatAvatarContainer}>
           <Text style={styles.chatAvatar}>{selectedChat?.user.avatar}</Text>
           {selectedChat?.user.online && <View style={styles.onlineIndicator} />}
         </View>
       <View>
        <Text style={styles.chatHeaderName}>{selectedChat?.user.name}</Text>
       <Text>
         {selectedChat?.user.online ? 'Online' : 'Offline'}
       </Text>
       </View>
     </View>
     <View style={styles.chatHeaderActions}>
       <TouchableOpacity style={styles.chatHeaderAction}>
         <Text>📞</Text>
       </TouchableOpacity>
       <TouchableOpacity style={styles.chatHeaderAction}>
         <Text>⋮</Text>
       </TouchableOpacity>
     </View>
      </View>

      <ScrollView style={styles.messageContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.dateHeader}>Sep 10, 2024</Text>

        <View style={styles.carImageContainer}>
          <View style={styles.carImage}>
             <Text style={styles.carImagePlaceholder}>🚗</Text>
          </View>
          <View style={styles.carImage}>
            <Text style={styles.carImagePlaceholder}>🚗</Text>
          </View>
        </View>
        <Text>Toyota Camry 2.4 XLE 2008 Blue</Text>

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </ScrollView>

      <MessageInput onSendMessage={handleSendMessage} />
   </SafeAreaView>
    </KeyboardAvoidingView>
 );

 const renderCurrentScreen = () => {
   switch (currentScreen) {
     case 'empty':
        return renderEmptyState();
     case 'list':
       return renderMessageList();
     case 'chat':
       return renderChatScreen();
    default: 
     return renderEmptyState();
   }
 };

   return renderCurrentScreen();
};

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: colors.bgTheme,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.blueRomance,
  },
  headerText: {
    color: colors.darkShadeBlack,
    fontSize: 24,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.blackGrey,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  emptyIconText: {
     color: colors.lightGrey,
     fontSize: 14,
  },
  emptyText: {
      color: colors.lightGrey,
     fontSize: 14,
     fontWeight: '500',
  },
  linkButton: {
    marginTop: 20,
  },
  linkText: {
    color: colors.black,
    fontSize: 16,
    textDecorationLine: 'underline'
  },
  conversationList: {
     flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.blueRomance,
    backgroundColor: colors.bgColor,
    height: 115,
  },
  backButton: {
   width: 24,
   height: 24,
   color: colors.darkGray
  },
  chatHeaderContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatAvatarContainer: {
    position: 'relative',
    marginRight: 10,
  },
  chatAvatar: {
    width: 40,
    height: 40,
    fontSize: 40,
    textAlign: 'center',
    lineHeight: 40,
    borderRadius: 20,
    backgroundColor: colors.blueRomance
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.indigoGreen,
    borderWidth: 2,
    borderColor: colors.bg
  },
  chatHeaderName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.dimGrey
  },
  chatHeaderStatus: {
    fontSize: 12,
    color: colors.indigoGreen
  },
  chatHeaderActions: {
    flexDirection: 'row'
  },
  chatHeaderAction: {
    marginLeft: 15,
    padding: 5,
  },
  messageContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  dateHeader: {
    textAlign: "center",
    color: colors.ashGrey,
    fontSize: 12,
    marginVertical: 15,
  },
  carImageContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  carImage: {
    width: 80,
    height: 60,
    backgroundColor: colors.blueRomance,
    borderRadius: 8,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  carImagePlaceholder: {
    fontSize: 24,
  },
  carTitle: {
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 15,
    color: colors.black
  }
})
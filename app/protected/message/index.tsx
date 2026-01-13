import React, { useCallback, useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text,
  StyleSheet,
  StatusBar,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
  } from 'react-native';
  import { SafeAreaView } from 'react-native-safe-area-context';
import MessageInput from '@/app/reusables/MessageInput';
import ConversationItem from '@/app/reusables/conversationItem';
import MessageBubble from '@/app/components/MessageBubble';
import SearchBar from '@/app/components/SearchBar';
import socketServices from '@/app/services/socketServices';
import userService from '@/app/services/userService';
import messageServices from '@/app/services/messageServices';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/app/context/AuthContext';
import { Conversation, Message, User, ScreenType, FileAttachment } from '@/app/types/message';
import { colors } from '@/app/constants/theme';
import { showErrorToast } from '@/app/utils/toast';


export default function MessageScreen() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('empty');
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const scrollViewRef = useRef<ScrollView>(null);
  const params = useLocalSearchParams<{
    sellerId?: string;
    productId: string;
    productTitle?: string;
    productImage?: string;
    previewMessage?: string;
  }>();
  
  // Get user and token from AuthContext
  const { user: currentUser, token, isInitialized } = useAuth();

  useEffect(() => {
    // Only initialize if auth is ready and user is logged in
    if (isInitialized && currentUser && token) {
      initializeApp();

      // Auto-open conversation if params provided 
      if (params.sellerId) {
        handleDirectMessage();
      }
    }
    
    return () => {
      socketServices.disconnect();
    }
  }, [isInitialized, currentUser, token, params.sellerId]);

 const handleDirectMessage = async () => {
  if (!params.sellerId) {
    console.error('No sellerId in params:', params);
    showErrorToast('Seller information missing');
    return;
  }

  try {
    setLoading(true);

    console.log('Creating Conversation with sellerId:', params.sellerId);

    // Fetch the seller's profile data
    let sellerData = null;
    try {
      const sellerResponse = await userService.getUserProfile(params.sellerId);
      
      if (sellerResponse?.user) {
        sellerData = {
          _id: sellerResponse.user._id,
          fullName: sellerResponse.user.fullName,
          email: sellerResponse.user.email,
          phoneNumber: sellerResponse.user.phoneNumber,
          role: sellerResponse.user.role,
          image: sellerResponse.user.image,
          isVerified: sellerResponse.user.isVerified,
        };
      }
    } catch (error) {
      console.log('Could not fetch seller profile, using fallback:', error);
      // Fallback to basic data if profile fetch fails
      sellerData = {
        _id: params.sellerId,
        fullName: 'Seller',
      };
    }

    // Get or create conversation with seller 
    const conversationResponse = await messageServices.getOrCreateConversation(
      params.sellerId
    );

    if (conversationResponse?.conversation) {
      const conversation = {
        ...conversationResponse.conversation,
        otherUser: sellerData || {
          _id: params.sellerId,
          fullName: 'Seller'
        }
      };

      setSelectedChat(conversation);
      setCurrentScreen('chat');

      // Join socket room 
      socketServices.joinRoom(conversation._id);

      // Send preview message with product details if provided 
      if (params.previewMessage && params.productId) {
        const messageData = {
          conversationId: conversation._id,
          text: params.previewMessage,
          from: currentUser?.id,
          to: params.sellerId,
          productId: params.productId,
          productTitle: params.productTitle,
          productImageUrl: params.productImage
        };

        socketServices.sendMessage(messageData);
      }

      // Load existing messages 
      const messagesResponse = await messageServices.getConversationMessages(
        conversation._id 
      );
      if (messagesResponse?.messages) {
        setMessages(messagesResponse.messages);
      }
    }
  } catch (error: any) {
    console.error('Error opening direct message:', error);
    console.error('Error details:', error.response?.data);
    showErrorToast(error.response?.data?.message || 'Failed to open conversation');
  } finally {
    setLoading(false);
  }
};

  const initializeApp = async () => {
     try {
       setLoading(true);

       // Connecting socket
       await socketServices.connect();

       // Load conversations 
       await loadConversations();

       // Set up socket listeners 
       setupSocketListeners();
     } catch(error) {
        console.error('Failed to initialize app:', error);
        showErrorToast('Failed to connect. Please check your internet connection.');
     } finally {
       setLoading(false);
     }
  };

  const loadConversations = async () => {
     try {
       const contactsResponse = await messageServices.getChatContacts();
       if (contactsResponse?.contacts) {
        // Transform contacts to conversation format 
        const transformedConversations: Conversation[] = contactsResponse.contacts.map((contact: User) => ({
          _id: `conv_${contact._id}`,
          sellerId: contact.role === 'seller' ? contact._id : currentUser?.id || '',
          customerId: contact.role === 'customer' ? contact._id : currentUser?.id || '',
          lastMessageAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          otherUser: contact
        }));

        setConversations(transformedConversations);
        if (transformedConversations.length > 0) {
           setCurrentScreen('list');
        }
       }
     } catch (error) {
       console.error('Failed to load conversations:', error);
       showErrorToast('Failed to load conversations');
     }
  };

  const setupSocketListeners = () => {
    socketServices.onReceiveMessage((message: Message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    });

    socketServices.onHistoricalMessages((historicalMessages: Message[]) => {
       setMessages(historicalMessages);
       setTimeout(scrollToBottom, 100);
    });

    socketServices.onNewMessageNotification((notification) => {
       console.log('New message notification:', notification);
       // Handle push notification here
    });

    socketServices.onTyping((data) => {
       if (data.conversationId === selectedChat?._id) {
         setTypingUsers(prev => new Set([...prev, data.userId]));
       }
    });

    socketServices.onStopTyping((data) => {
       if (data.conversationId === selectedChat?._id) {
         setTypingUsers(prev => {
           const newSet = new Set(prev);
           newSet.delete(data.userId);
           return newSet;
         });
       }
    });
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const handleConversationPress = async (conversation: Conversation) => {
     try {
       setLoading(true);

       // Get or create real conversation 
       const conversationResponse = await messageServices.getOrCreateConversation(
        conversation.otherUser!._id
       );

       if (conversationResponse?.conversation) {
         const realConversation = {
          ...conversationResponse.conversation,
          otherUser: conversation.otherUser
         };

         setSelectedChat(realConversation);
         setCurrentScreen('chat');

         // Join socket room 
         socketServices.joinRoom(realConversation._id);

         // load messages 
         const messagesResponse = await messageServices.getConversationMessages(realConversation._id);
         if (messagesResponse?.messages) {
          setMessages(messagesResponse.messages);
         }
       }
     } catch (error) {
       console.error('Failed to open conversation:', error);
       showErrorToast('Failed to open conversation');
     } finally {
      setLoading(false);
     }
  };

 const handleSendMessage = useCallback(async (messageText: string) => {
     if (!selectedChat || !currentUser) return;

     const messageData = {
       conversationId: selectedChat._id,
       text: messageText,
       from: currentUser.id,
       to: selectedChat.otherUser?._id,
     };

     socketServices.sendMessage(messageData);
 }, [selectedChat, currentUser]);

 const handleSendFile = useCallback(async (file: FileAttachment) => {
   if (!selectedChat || !currentUser) return;

   const messageData = {
     conversationId: selectedChat._id,
     text: '',
     file: {
       filename: file.name || 'attachment',
       path: file.uri,
       mimetype: file.mimeType || 'application/octet-stream',
       size: file.size || 0,
     },
     from: currentUser.id,
     to: selectedChat.otherUser?._id,
   };

   socketServices.sendMessage(messageData);
 }, [selectedChat, currentUser]);

 const handleTyping = useCallback(() => {
   if (selectedChat) {
     socketServices.startTyping(selectedChat._id);
   }
 }, [selectedChat]);

 const handleStopTyping = useCallback(() => {
  if (selectedChat) {
     socketServices.stopTyping(selectedChat._id);
  }
 }, [selectedChat]);

 // Show loading spinner while auth is initializing
 if (!isInitialized) {
   return (
     <SafeAreaView style={styles.container}>
       <View style={styles.loadingContainer}>
         <ActivityIndicator size="large" color={colors.skyBlue} />
         <Text style={styles.loadingText}>Loading...</Text>
       </View>
     </SafeAreaView>
   );
 }

 // Show auth required message if not logged in
 if (!currentUser || !token) {
   return (
     <SafeAreaView style={styles.container}>
       <View style={styles.emptyState}>
         <Text style={styles.emptyText}>Please log in to view messages</Text>
       </View>
     </SafeAreaView>
   );
 }

 const renderEmptyState = () => (
   <SafeAreaView style={styles.container}>
     <StatusBar barStyle="dark-content" backgroundColor="white" />

     <View style={styles.header}>
       <Text style={styles.headerText}>Messages</Text>
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
          <Text style={styles.linkText}>Start a conversation</Text>
       </TouchableOpacity>
     </View>
   </SafeAreaView>
 );

 const renderMessageList = () => (
   <SafeAreaView style={styles.container}>
     <StatusBar barStyle="dark-content" backgroundColor="white" />

     <View style={styles.header}>
       <Text style={styles.headerText}>Messages</Text>
     </View>

     <SearchBar />

     <FlatList
        data={conversations}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ConversationItem
            conversation={item}
            onPress={handleConversationPress}
          />
        )}
        style={styles.conversationList}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={loadConversations}
      />
   </SafeAreaView>
 );

const renderChatScreen = () => (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => setCurrentScreen('list')}>
            <Image
              source={require('../../../assets/images/arrow-left.png')}
              style={styles.backButton}
            />
          </TouchableOpacity>
          <View style={styles.chatHeaderContent}>
            <View style={styles.chatAvatarContainer}>
              {selectedChat?.otherUser?.image ? (
                <Image
                  source={{ uri: selectedChat.otherUser.image }}
                  style={styles.chatAvatar}
                />
              ) : (
                <View style={styles.chatAvatarPlaceholder}>
                  <Text style={styles.chatAvatarText}>
                    {selectedChat?.otherUser?.fullName?.charAt(0) || '?'}
                  </Text>
                </View>
              )}
              {selectedChat?.otherUser && (
                <>
                 {/*When ready for online inidicator */}
                </>
              )}
            </View>
            <View>
              <Text style={styles.chatHeaderName}>
                {selectedChat?.otherUser?.fullName || 'Unknown User'}
              </Text>
              <Text style={styles.chatHeaderStatus}>
                {typingUsers.size > 0 ? 'Typing...' : ''}
              </Text>
            </View>
          </View>
          <View style={styles.chatHeaderActions}>
            {/* <TouchableOpacity style={styles.chatHeaderAction}>
              <Text>📞</Text>
            </TouchableOpacity> */}
            <TouchableOpacity style={styles.chatHeaderAction}>
              <Text style={styles.threeDots}>⋮</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.messageContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
        >
          <Text style={styles.dateHeader}>
            {new Date().toLocaleDateString()}
          </Text>

          {/* Show product preview if this is an ad-related conversation */}
          {selectedChat?.adTitle && (
            <View style={styles.productPreview}>
              <View style={styles.carImageContainer}>
                <View style={styles.carImage}>
                  <Text style={styles.carImagePlaceholder}>📦</Text>
                </View>
              </View>
              <Text style={styles.productTitle}>{selectedChat.adTitle}</Text>
            </View>
          )}

          {messages.map((message) => (
            <MessageBubble
              key={message._id}
              message={message}
              currentUserId={currentUser?.id}
            />
          ))}

          {typingUsers.size > 0 && (
            <View style={styles.typingIndicator}>
              <Text style={styles.typingText}>Typing...</Text>
            </View>
          )}
        </ScrollView>

        <MessageInput
          onSendMessage={handleSendMessage}
          onSendFile={handleSendFile}
          onTyping={handleTyping}
          onStopTyping={handleStopTyping}
          disabled={loading}
        />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.blackGrey,
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
  emptyText: {
      color: colors.lightGrey,
     fontSize: 16,
     fontWeight: '500',
     textAlign: 'center',
  },
  linkButton: {
    marginTop: 20,
  },
  linkText: {
    color: colors.skyBlue,
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
    backgroundColor: colors.bg,
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
    marginLeft: 15,
  },
  chatAvatarContainer: {
    position: 'relative',
    marginRight: 10,
  },
  chatAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.blueRomance
  },
  chatAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.blueRomance,
    justifyContent: 'center',
    alignItems: 'center',
  },
   chatAvatarText: {
    fontSize: 18,
    textAlign: 'center',
    color: colors.blackGrey,
    fontWeight: '600',
  },
  // onlineIndicator: {
  //   position: 'absolute',
  //   bottom: 2,
  //   right: 2,
  //   width: 10,
  //   height: 10,
  //   borderRadius: 5,
  //   backgroundColor: colors.indigoGreen,
  //   borderWidth: 2,
  //   borderColor: colors.bg
  // },
  chatHeaderName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.darkGray
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
  threeDots: {
   fontSize: 20,
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
  productPreview: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
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
  productTitle: {
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  typingIndicator: {
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  typingText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});
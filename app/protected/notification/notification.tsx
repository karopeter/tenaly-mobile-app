import { useEffect, useState, useCallback } from 'react';
import { 
   View,
   Text,
   FlatList,
   TouchableOpacity,
   Image,
   StyleSheet,
   ActivityIndicator,
   RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import apiClient from '@/app/utils/apiClient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { showErrorToast } from '@/app/utils/toast';
import { Notification } from '@/app/types/notification.types';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '@/app/constants/theme';

const NotificationScreen = () => {
 const [notifications, setNotifications] = useState<Notification[]>([]);
 const [loading, setLoading] = useState(true);
 const [refreshing, setRefreshing] = useState(false);
 const router = useRouter();

//  useEffect(() => {
//      fetchNotifications();
//  }, []);


useFocusEffect(
  useCallback(() => {
    fetchNotifications();
  }, [])
);
  
 const fetchNotifications = async () => {
   try {
    if (!apiClient) {
      showErrorToast("API client is not initialized");
      return;
    }
    setLoading(true);
    const response = await apiClient.get('/api/notification');

    if (response.data.success) {
        setNotifications(response.data.notifications || []);
    }
   } catch(error: any) {
     console.error('Error fetching notifications:', error);
     showErrorToast('Failed to load notifications');
   } finally {
     setLoading(false);
     setRefreshing(false);
   }
 };

 const onRefresh = () => {
     setRefreshing(true);
     fetchNotifications();
 };

 const handleMarkAllAsRead = async () => {
     try {
      if (!apiClient) {
        showErrorToast("API Client is not initialized");
        return
      }
      await apiClient.patch('/api/notification/mark-all-read');

      setNotifications(prevNotifications => 
        prevNotifications.map(notif => ({ ...notif, isRead: true }))
      );
     } catch (error) {
       console.error('Error marking all as read:', error);
       showErrorToast('Failed to mark all as read');
     }
 };

 const handleNotificationPress = async (notification: Notification) => {
     try {
     if (!apiClient) {
        showErrorToast("API client is not initialized");
        return;
     }

    // Mark as read 
    if (!notification.isRead) {
        await apiClient.patch(`/api/notification/${notification._id}/read`);

        setNotifications(prevNotifications => 
            prevNotifications.map(notif => 
              notif._id === notification._id ? { ...notif, isRead: true } : notif
            )
        );
    }

    // Navigate to ad details if there's a related ad 
    if (notification.relatedCarAdId?._id) {
        router.push({
          pathname: '/protected/ad/[adId]',
          params: { adId: notification.relatedCarAdId._id },
        });
    }
     } catch (error) {
        console.error("Error handling  notification press:", error);
     }
 };

 const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ad_approved':
         return '✅';
     case 'ad_rejected':
        return '❌';
     case 'ad_created': 
       return '🎉';
    case 'ad_expired': 
       return '⏰';
     case 'new_ad_alert':
        return '🔔';
     default: 
       return '📢';
    }
 };

 const formatTime = (dateString: string) => {
     const date = new Date(dateString);
     const now = new Date();
     const diffInMs = now.getTime() - date.getTime();
     const diffInMins = Math.floor(diffInMs / 60000);
     const diffInHours = Math.floor(diffInMins / 3600000);
     const diffInDays = Math.floor(diffInMins / 86400000);

     if (diffInMins < 1) return 'Just now';
     if (diffInMins < 60) return `${diffInMins}m ago`;
     if (diffInHours < 24) return `${diffInHours}h ago`;
     if (diffInDays === 1) return 'Yesterday';
     if (diffInDays < 7) return `${diffInDays}d ago`;

     return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric'});
 };

  const renderNotificationItem = ({ item }: { item: Notification  }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.isRead && styles.unreadNotification,
      ]}
      onPress={() => handleNotificationPress(item)}
     >
      <View style={styles.notificationContent}>
        {item.hasImages && item.previewImage ? (
            <Image
             source={{ uri: item.previewImage }}
             style={styles.notificationImage}
             resizeMode="cover" 
            />
        ): (
          <View style={styles.notificationIconContainer}>
            <Text style={styles.notificationEmoji}>
               {getNotificationIcon(item.type)}
            </Text>
          </View>
        )}

        <View style={styles.notificationTextContainer}>
          <Text
           style={[
             styles.notificationMessage,
             !item.isRead && styles.unreadText,
           ]}
           numberOfLines={2}
          >
            {item.message}
          </Text>

          {/* {item.relatedCarAdId?.location && (
            <Text style={styles.notificationLocation} numberOfLines={1}>
              📍 {item.relatedCarAdId.location}
            </Text>
          )} */}
        </View>
      </View>

      {!item.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

   const renderEmptyState = () => (
     <View style={styles.emptyContainer}>
       <View style={styles.emptyIconContainer}>
          <Text style={styles.emptyIcon}>🔔</Text>
          <View style={styles.emptyBadge} />
       </View>
       <Text style={styles.emptyText}>No Notification yet</Text>
     </View>
   );

   if (loading) {
     return (
      <View style={styles.loadingContainer}>
       <ActivityIndicator size="large" color="#5555DD" />
       <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
     );
   }

   return (
    <SafeAreaView style={styles.container}>
     {/* Header */}
     <View style={styles.header}>
       <TouchableOpacity
         style={styles.backButton}
         onPress={() => router.back()}
       >
        <Text style={styles.backIcon}>←</Text>
       </TouchableOpacity>

       <Text style={styles.headerTitle}>Notifications</Text>
       {notifications.length > 0 && (
        <TouchableOpacity onPress={handleMarkAllAsRead}>
           <Text style={styles.markAllRead}>Mark all as read</Text>
        </TouchableOpacity>
       )}
     </View>
     

     {/* Notification List */}
     {notifications.length === 0 ? (
        renderEmptyState()
     ): (
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#5555DD"
            />
        }
        showsVerticalScrollIndicator={false}
      />
     )}
    </SafeAreaView>
   );
 };

 const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgTheme,
  },
  header: {
   flexDirection: 'row',
   alignItems: 'center',
   paddingHorizontal: 20,
   backgroundColor: colors.bg,
   shadowColor: colors.blurGrey,
   paddingTop: 30,
   paddingBottom: 20,
   shadowOffset: { width: 0, height: 4, },
   shadowOpacity: 0.1,
   elevation: 6,
  },
  backButton: {
    marginRight: 15
  },
  backIcon: {
    fontSize: 24,
    color: colors.grey300
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
    marginLeft: 8,
  },
  markAllRead: {
    fontSize: 13,
    color: '#5555DD',
    fontWeight: '500'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color:  '#8C8C8C',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 120,
  },
  emptyIconContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  emptyIcon: {
    fontSize: 80,
  },
  emptyBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF6B6B',
  },
  emptyText: {
    fontSize: 16,
    color: '#8C8C8C',
    fontWeight: '500'
  },
  listContent: {
    paddingVertical: 8,
  },
  notificationItem: {
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  unreadNotification: {
  },
  notificationContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  notificationImage: {
    width: 100,
    height: 60,
    borderRadius: 4,
    marginRight: 12
  },
  notificationIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationEmoji: {
    fontSize: 28,
  },
  notificationTextContainer: {
    flex: 1,
  },
   notificationMessage: {
    fontSize: 14,
    color: '#525252',
    marginBottom: 4,
    lineHeight: 20,
   },
   unreadText: {
    fontWeight: '600',
    color: '#333333',
   },
   notificationLocation: {
    fontSize: 14,
    color: '#525252',
    fontWeight: '400',
    marginBottom: 4,
   },
   notificationTime: {
     fontSize: 12,
    color: '#AAAAAA',
   },
   unreadDot: {
     width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#5555DD',
    marginLeft: 8,
   }
 });

 export default NotificationScreen;
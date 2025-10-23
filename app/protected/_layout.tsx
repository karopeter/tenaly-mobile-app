import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter, useSegments, Stack, Slot } from 'expo-router';

export default function ProtectedLayout() {
  const segments = useSegments();
  const router = useRouter();

  const navItems = [
    {
      label: 'Home', 
      icon: <AntDesign name="home" size={24} color="#8C8C8C" />,
      activeIcon: <Ionicons name="home" size={24} color="#1031AA" />,
      activeIconText: (
        <Text style={{ color: '#1031AA'}}>Home</Text>
      ),
      route: '/protected/home'
    },
    {
      label: 'My Ads',
      icon: <Ionicons name="car-outline" size={24} color="#8C8C8C" />,
      activeIcon: <Ionicons name="car" size={24} color="#1031AA" />,
      activeIconText: (
        <Text style={{ color: '#1031AA'}}>My Ads</Text>
      ),
      route: '/protected/myads'
    },
    {
      label: 'Message',
      icon: <Entypo name="chat" size={24} color="#8C8C8C" />,
      activeIcon: <Entypo name="chat" size={24} color="#1031AA" />,
      activeIconText: (
        <Text style={{ color: '#1031AA'}}>Message</Text>
      ),
      route: '/protected/message'
    },
    {
     label: 'Wallet',
     icon: <MaterialCommunityIcons name="wallet-outline" size={24} color="#8C8C8C" />,
     activeIcon: <MaterialCommunityIcons name="wallet-outline" size={24} color="#1031AA" />,
      activeIconText: (
        <Text style={{ color: '#1031AA'}}>Wallet</Text>
      ),
     route: '/protected/wallet'
    },
    {
     label: 'Settings',
     icon: <MaterialCommunityIcons name="account-cog" size={24} color="#8C8C8C" />,
     activeIcon: <MaterialCommunityIcons name="account-cog" size={24} color="#1031AA" />,
     activeIconText: (
       <Text style={{ color: '#1031AA'}}>Settings</Text>
     ),
     route: '/protected/settings'
    }
  ];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={{ flex: 1, paddingBottom: 20 }}>
        <Slot />
      </View>

      <View className="h-[1px] bg-[#F8F8F8] w-full" />

      {/* Bottom Nav Bar */}
      <View 
         style={{
            backgroundColor: '#F8F8F8'
         }}
        className="h-[74px] flex-row justify-around border-[1px] border-[#EDEDED]">
        {navItems.map((item, index) => {
          const currentRoute = segments[1]; 
          const isActive = currentRoute === item.route?.split('/').pop();

          return (
            <TouchableOpacity
              key={index}
              className="flex-1 items-center justify-center"
              onPress={() => {
                if (item.route) {
                  router.push(item.route);
                } 
              }}
            >
              <View className="items-center justify-center">
                {isActive ? item.activeIcon : item.icon}
                <Text
                  className={`text-[12px] ${
                    isActive ? 'text-[#9DB2CE] font-[400]' : 'text-[#9DB2CE]'
                  }`}
                >
                  {isActive ? item.activeIconText : item.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
}
import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import { useFonts, WorkSans_400Regular, WorkSans_500Medium, WorkSans_600SemiBold, WorkSans_700Bold } from "@expo-google-fonts/work-sans";
import { AuthProvider } from "./context/AuthContext";
import { ActivityIndicator, View  } from "react-native";
import "../global.css";

const RootLayout = () => {
   const [fontsLoaded] = useFonts({
    WorkSans_400Regular,
    WorkSans_500Medium,
    WorkSans_600SemiBold,
    WorkSans_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }


  return (
    <AuthProvider>
       <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
       <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
       <Stack.Screen name="auth/login" options={{ headerShown: false }} />
       <Stack.Screen name="auth/forgot-password" options={{ headerShown: false  }} />
       <Stack.Screen name="auth/verify-code" options={{ headerShown: false }} />
       <Stack.Screen name="auth/reset-password" options={{ headerShown: false }} />
       <Stack.Screen name="auth/complete-profile" options={{ headerShown: false }} />
       <Stack.Screen 
         name="auth/success"
          options={{ 
          headerShown: false 
        }}  />
        <Stack.Screen name="protected/home" options={{ headerShown: false }} />
    </Stack>
    <Toast />
    </AuthProvider>
  );
}

export default RootLayout;
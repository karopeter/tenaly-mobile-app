import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import { 
  useFonts, 
  WorkSans_400Regular, 
  WorkSans_500Medium, 
  WorkSans_600SemiBold, 
  WorkSans_700Bold 
} from "@expo-google-fonts/work-sans";
import { AuthProvider } from "./context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ActivityIndicator, View  } from "react-native";
import "../global.css";

// Create a client instancce outside the component to avoid recreating on each render 
const queryClient = new QueryClient({
   defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes 
    },
   },
});


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
   <QueryClientProvider client={queryClient}>
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
   </QueryClientProvider>
  );
}

export default RootLayout;
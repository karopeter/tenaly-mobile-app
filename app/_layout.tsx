import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import { AuthProvider } from "./context/AuthContext";
import "../global.css";

const RootLayout = () => {
  return (
    <AuthProvider>
       <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
       <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
       <Stack.Screen name="auth/login" options={{ headerShown: false }} />
       <Stack.Screen name="auth/forgot-password" options={{ headerShown: false  }} />
       <Stack.Screen name="auth/verify-code" options={{ headerShown: false }} />
       <Stack.Screen name="auth/reset-password" options={{ headerShown: false }} />
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
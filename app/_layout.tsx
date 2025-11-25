import { use } from "react";
import { Stack } from "expo-router";
import { AuthContext, AuthProvider } from "@/context/auth";

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

function RootNavigator() {
  const { session } = use(AuthContext);

  return (
    <Stack>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={!session}>
        <Stack.Screen name="signin" />
        <Stack.Screen name="changepassword" />
      </Stack.Protected>
    </Stack>
  );
}

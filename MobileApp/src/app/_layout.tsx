import {
  Stack,
} from "expo-router";

import {
  AuthProvider,
} from "../auth/AuthContext";

import {
  LanguageProvider,
} from "../Language/LanguageContext";


export default function RootLayout() {

  return (

    <LanguageProvider>

      <AuthProvider>

        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >

          <Stack.Screen
            name="(tabs)"
          />

          <Stack.Screen
            name="writings/[id]"
          />

          <Stack.Screen
            name="users/[id]"
          />

        </Stack>

      </AuthProvider>

    </LanguageProvider>

  );

}
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/signup" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

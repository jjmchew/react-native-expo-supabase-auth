import { use, useEffect, useState } from "react";
import { Alert, StyleSheet, View, TextInput, Button } from "react-native";
import { supabase } from "../lib/supabase";
import * as Linking from "expo-linking";
import { AuthContext } from "@/context/auth";
import { Stack, router } from "expo-router";
import ViewWithKeyboard from "@/components/ViewWithKeyboard";

export default function SignIn() {
  const authContext = use(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const subscription = Linking.addEventListener(
      "url",
      ({ url }: { url: string }) => {
        console.log(`subscription: ${url.slice(30)}...`);
        const replacedUrl = url.replace("#", "?");
        const parsedUrl = Linking.parse(replacedUrl);
        const accessToken = parsedUrl.queryParams?.access_token as string;
        const refreshToken = parsedUrl.queryParams?.refresh_token as string;
        const { path } = parsedUrl;
        console.log("handleDeepLink", path, refreshToken);
        if (path === "changepassword") {
          router.push({
            pathname: "/changepassword",
            params: {
              accessToken,
              refreshToken,
            },
          });
        }
      },
    );

    return () => subscription.remove();
  }, []);

  async function signInWithEmail() {
    setLoading(true);
    await authContext.signIn({ email, password });
    setLoading(false);
    router.replace("/home");
  }

  async function signUpWithEmail() {
    setLoading(true);
    await authContext.signUp({ email, password });
    setLoading(false);
  }

  async function resetPasswordForEmail() {
    setLoading(true);

    const redirectUrl = Linking.createURL("/changepassword");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) Alert.alert(`error resetting password: ${error.message}`);
    else Alert.alert(`Please check your inbox for password reset email.`);

    setLoading(false);
  }

  return (
    <ViewWithKeyboard>
      <Stack.Screen options={{ title: "Sign In" }} />
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <TextInput
          style={styles.input}
          onChangeText={(text: string) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          keyboardType="default"
        />
      </View>
      <View style={styles.verticallySpaced}>
        <TextInput
          style={styles.input}
          onChangeText={(text: string) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          keyboardType="default"
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          title="Sign in"
          disabled={loading}
          onPress={() => signInWithEmail()}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Button
          title="Sign up"
          disabled={loading}
          onPress={() => signUpWithEmail()}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Button
          title="forgot password"
          disabled={loading}
          onPress={() => resetPasswordForEmail()}
        />
      </View>
      <View style={{ height: 30 }} />
    </ViewWithKeyboard>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
  input: {
    borderColor: "gray",
    borderWidth: 1,
    paddingHorizontal: 10,
    width: 317,
    borderRadius: 5,
    backgroundColor: "#f0f0f0",
    color: "black",
    fontSize: 16,
  },
});

import { useState } from "react";
import { supabase } from "../lib/supabase";
import {
  StyleSheet,
  ScrollView,
  View,
  Alert,
  Button,
  Text,
  TextInput,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";

const loginWithToken = async ({
  access_token,
  refresh_token,
}: {
  access_token: string;
  refresh_token: string;
}) => {
  const signIn = async () => {
    await supabase.auth.setSession({
      access_token,
      refresh_token,
    });

    return await supabase.auth.refreshSession();
  };
  const {
    data: { session: newSession },
  } = await signIn();

  return newSession;
};

export default function ChangePassword() {
  const { accessToken, refreshToken } = useLocalSearchParams();

  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");

  if (typeof accessToken === "string" && typeof refreshToken === "string") {
  }

  async function updatePassword({ password }: { password: string }) {
    if (typeof accessToken !== "string" || typeof refreshToken !== "string") {
      Alert.alert("No access token or refresh token");
      return;
    }

    try {
      setLoading(true);

      await loginWithToken({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      router.push({ pathname: "/" });
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View>
      <Stack.Screen options={{ title: "Change Password" }} />
      <ScrollView
        style={styles.container}
        automaticallyAdjustKeyboardInsets={true}
      >
        <View>
          <Text>Update Password</Text>
        </View>
        <View style={styles.verticallySpaced}>
          <TextInput
            style={styles.input}
            value={password || ""}
            onChangeText={(text) => setPassword(text)}
            placeholder="password"
            secureTextEntry={true}
          />
        </View>

        <View style={[styles.verticallySpaced, styles.mt20]}>
          <Button
            title={loading ? "Loading ..." : "Update"}
            onPress={() => updatePassword({ password })}
            disabled={loading}
          />
        </View>
      </ScrollView>
    </View>
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

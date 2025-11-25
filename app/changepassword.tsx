import { use, useState } from "react";
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
import { AuthContext } from "@/context/auth";

export default function ChangePassword() {
  const authContext = use(AuthContext);

  const { accessToken, refreshToken } = useLocalSearchParams<{
    accessToken: string;
    refreshToken: string;
  }>();

  const didReceiveTokens = tokensReceived({ accessToken, refreshToken });
  console.log({ didReceiveTokens });

  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");

  async function updatePassword({ password }: { password: string }) {
    try {
      setLoading(true);

      if (typeof accessToken !== "string" || typeof refreshToken !== "string") {
        throw new Error("type assertion for typescript");
      }

      await authContext.loginWithToken({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      await authContext.updatePassword(password);

      router.push({ pathname: "/home" });
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {didReceiveTokens ? (
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
      ) : null}
    </>
  );
}

const tokensReceived = ({
  accessToken,
  refreshToken,
}: {
  accessToken?: string;
  refreshToken?: string;
}) => {
  if (typeof accessToken !== "string" || typeof refreshToken !== "string")
    return false;
  return true;
};

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

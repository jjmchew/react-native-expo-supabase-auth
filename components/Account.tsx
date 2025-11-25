import { use, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { StyleSheet, View, Alert, Button, TextInput } from "react-native";
import Avatar from "@/components/Avatar";
import ViewWithKeyboard from "@/components/ViewWithKeyboard";
import { AuthContext } from "@/context/auth";
import { router } from "expo-router";
import { useSupabase } from "@/hooks/useSupabase";

export default function Account() {
  const { session } = use(AuthContext);
  const { signOut } = useSupabase();

  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [website, setWebsite] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (session) getProfile();
  }, [session]);

  async function getProfile() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const { data, error, status } = await supabase
        .from("profiles")
        .select(`username, website, avatar_url`)
        .eq("id", session?.user.id)
        .single();
      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setUsername(data.username);
        setWebsite(data.website);
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile({
    username,
    website,
    avatar_url,
  }: {
    username: string;
    website: string;
    avatar_url: string;
  }) {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const updates = {
        id: session?.user.id,
        username,
        website,
        avatar_url,
        updated_at: new Date(),
      };

      const { error } = await supabase.from("profiles").upsert(updates);

      if (error) {
        throw error;
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  const handleSignOut = () => {
    signOut();
    router.replace("/signin");
  };

  return (
    <ViewWithKeyboard>
      <View style={styles.container}>
        <View>
          <Avatar
            size={200}
            url={avatarUrl}
            onUpload={(url: string) => {
              setAvatarUrl(url);
              updateProfile({ username, website, avatar_url: url });
            }}
          />
        </View>
        <View style={[styles.verticallySpaced, styles.mt20]}>
          <TextInput value={session?.user?.email} style={styles.input} />
        </View>
        <View style={styles.verticallySpaced}>
          <TextInput
            style={styles.input}
            value={username || ""}
            onChangeText={(text) => setUsername(text)}
            placeholder="username"
          />
        </View>
        <View style={styles.verticallySpaced}>
          <TextInput
            style={styles.input}
            value={website || ""}
            onChangeText={(text) => setWebsite(text)}
            placeholder="website"
          />
        </View>

        <View style={[styles.verticallySpaced, styles.mt20]}>
          <Button
            title={loading ? "Loading ..." : "Update"}
            onPress={() =>
              updateProfile({ username, website, avatar_url: avatarUrl })
            }
            disabled={loading}
          />
        </View>

        <View style={styles.verticallySpaced}>
          <Button title="Sign Out" onPress={handleSignOut} />
        </View>
      </View>
    </ViewWithKeyboard>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 60,
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
    borderRadius: 5,
    backgroundColor: "#f0f0f0",
    color: "black",
    fontSize: 16,
  },
});

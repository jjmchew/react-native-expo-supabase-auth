import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Auth from "@/components/Auth";
import Account from "@/components/Account";
import { Session } from "@supabase/supabase-js";
import { Text, View } from "react-native";
import { router } from "expo-router";
import * as Linking from "expo-linking";

export default function Index() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleDeepLink(url);
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      console.log("onAuthStateChange:", _event);
      setSession(session);
    });
  }, []);

  const handleDeepLink = (url: string) => {
    const replacedUrl = url.replace("#", "?");
    const parsedUrl = Linking.parse(replacedUrl);
    const accessToken = parsedUrl.queryParams?.access_token as string;
    const refreshToken = parsedUrl.queryParams?.refresh_token as string;
    const { path } = parsedUrl;
    if (path === "changepassword") {
      router.push({
        pathname: "/changepassword",
        params: {
          accessToken,
          refreshToken,
        },
      });
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#25292e",
      }}
    >
      {session && session.user ? (
        <>
          <Text>Logged in!!</Text>
          <Account key={session.user.id} session={session} />
        </>
      ) : (
        <Auth />
      )}
    </View>
  );
}

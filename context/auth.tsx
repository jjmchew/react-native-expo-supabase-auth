import {
  useState,
  useEffect,
  createContext,
  type PropsWithChildren,
} from "react";
import { AppState, Alert } from "react-native";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface UserInfoProps {
  email: string;
  password: string;
}

interface LoginWithTokenProps {
  access_token: string;
  refresh_token: string;
}

export interface AuthContextProps {
  session: Session | null;
  signIn: (userInfo: UserInfoProps) => Promise<boolean>;
  signUp: (userInfo: UserInfoProps) => Promise<boolean>;
  signOut: () => void;
  loginWithToken: ({
    access_token,
    refresh_token,
  }: LoginWithTokenProps) => Promise<boolean>;
  updatePassword: (password: string) => Promise<boolean>;
}

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export const AuthContext = createContext<AuthContextProps>({
  session: null,
  signIn: (_userInfo: UserInfoProps) => Promise.resolve(true),
  signUp: (_userInfo: UserInfoProps) => Promise.resolve(true),
  signOut: () => {},
  loginWithToken: (_props: LoginWithTokenProps) => Promise.resolve(true),
  updatePassword: (_password: string) => Promise.resolve(true),
});

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      console.log("onAuthStateChange:", _event);
      setSession(session);
    });
  }, []);

  const signUp = async ({ email, password }: UserInfoProps) => {
    const {
      data: { session: newSession },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });
    if (error) Alert.alert(error.message);

    if (!error && !session)
      Alert.alert("Please check your inbox for email verification!");

    setSession(newSession);
    return true;
  };

  const signIn = async ({ email, password }: UserInfoProps) => {
    const {
      data: { session: newSession },
      error,
    } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    setSession(newSession);
    return true;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

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

    setSession(newSession);
    return true;
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });

    if (error) throw error;
    return true;
  };

  return (
    <AuthContext
      value={{
        session,
        signUp,
        signIn,
        signOut,
        loginWithToken,
        updatePassword,
      }}
    >
      {children}
    </AuthContext>
  );
};

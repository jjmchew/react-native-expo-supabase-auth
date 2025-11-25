import {
  useState,
  useEffect,
  createContext,
  type PropsWithChildren,
} from "react";
import { AppState } from "react-native";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export interface AuthContextProps {
  session: Session | null;
  setSession: (_session: Session | null) => void;
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
  setSession: (_session: Session | null) => {},
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

  return (
    <AuthContext
      value={{
        session,
        setSession,
      }}
    >
      {children}
    </AuthContext>
  );
};

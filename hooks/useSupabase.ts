import { use, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Alert } from "react-native";
import { AuthContext } from "@/context/auth";
import * as ImagePicker from "expo-image-picker";
import { SupabaseError, isSupabaseErrorData } from "@/types/SupabaseError";

interface SupabaseFunction<TProps, TResult> {
  (props: TProps): TResult;
}

interface WrapSupabaseProps<TProps, TResult> {
  fn: SupabaseFunction<TProps, TResult>;
  args: TProps;
}

export function useSupabase() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const useAuth = use(AuthContext);

  /*
   * Generic wrapper with try/catch/finally for individual supabase functions
   */
  const wrapSupabase = async <TProps, TResult>({
    fn,
    args,
  }: WrapSupabaseProps<TProps, TResult>): Promise<TResult> => {
    try {
      setError(null);
      setLoading(true);
      return await fn(args);
    } catch (err) {
      if (isSupabaseErrorData(err)) {
        const supabaseError = new SupabaseError(err.message, err);
        setError(supabaseError);
        throw supabaseError;
      } else if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error("wrapSupabase: Unknown Error received"));
      }
      throw err; // TResult or err as only return
    } finally {
      setLoading(false);
    }
  };

  /*
   * SignUp
   */
  interface UserInfoProps {
    email: string;
    password: string;
  }
  const signUp = async (props: UserInfoProps) =>
    wrapSupabase<UserInfoProps, void>({ fn: _signUp, args: props });

  const _signUp = async ({ email, password }: UserInfoProps) => {
    //TODO: known issue with submitting existing emails for signUp
    //- need to check user table for existing emails first

    const {
      data: { session: newSession },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);

    if (!error && !newSession)
      Alert.alert("Please check your inbox for email verification!");

    useAuth.setSession(newSession);
  };

  /*
   * SignIn
   */
  const signIn = async (props: UserInfoProps) =>
    wrapSupabase<UserInfoProps, void>({ fn: _signIn, args: props });

  const _signIn = async ({ email, password }: UserInfoProps) => {
    const {
      data: { session: newSession },
      error,
    } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    useAuth.setSession(newSession);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  /*
   * loginWithToken
   */
  interface LoginWithTokenProps {
    access_token: string;
    refresh_token: string;
  }

  const loginWithToken = async (props: LoginWithTokenProps) =>
    wrapSupabase<LoginWithTokenProps, void>({
      fn: _loginWithToken,
      args: props,
    });

  const _loginWithToken = async ({
    access_token,
    refresh_token,
  }: LoginWithTokenProps) => {
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

    useAuth.setSession(newSession);
  };

  /*
   * updatePassword
   */
  const updatePassword = async (props: string) =>
    wrapSupabase<string, void>({
      fn: _updatePassword,
      args: props,
    });

  const _updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  };

  /*
   * resetPassword
   */
  interface ResetPasswordProps {
    redirectUrl: string;
    email: string;
  }

  const resetPassword = async (props: ResetPasswordProps) =>
    wrapSupabase<ResetPasswordProps, void>({
      fn: _resetPassword,
      args: props,
    });

  const _resetPassword = async ({ redirectUrl, email }: ResetPasswordProps) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) Alert.alert(error.message);
    else Alert.alert(`Please check your inbox for password reset email.`);
  };

  /*
   * uploadAvatar
   */
  interface UploadAvatarProps {
    path: string;
    arrayBuffer: ArrayBuffer;
    image: Blob | ImagePicker.ImagePickerAsset;
  }

  interface UploadAvatarReturn {
    id: string;
    path: string;
    fullPath: string;
  }

  const uploadAvatar = async (
    props: UploadAvatarProps,
  ): Promise<UploadAvatarReturn> =>
    wrapSupabase<UploadAvatarProps, Promise<UploadAvatarReturn>>({
      fn: _uploadAvatar,
      args: props,
    });

  const _uploadAvatar = async ({
    path,
    arrayBuffer,
    image,
  }: UploadAvatarProps) => {
    const contentType =
      (image instanceof Blob ? image?.type : image?.mimeType) ?? "image/jpeg";

    const { data, error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, arrayBuffer, {
        contentType,
      });

    if (uploadError) {
      throw uploadError;
    }

    return data;
  };

  /*
   * downloadAvatar
   */

  const downloadAvatar = async (props: string) =>
    wrapSupabase<string, Promise<Blob>>({
      fn: _downloadAvatar,
      args: props,
    });

  const _downloadAvatar = async (path: string) => {
    const { data, error } = await supabase.storage
      .from("avatars")
      .download(path);

    if (error) {
      throw error;
    }

    return data as Blob;
  };

  /*
   * updateProfile
   */
  interface UpdateProfileProps {
    id?: string;
    username?: string;
    website?: string;
    avatar_url?: string;
    updated_at?: Date;
  }

  const updateProfile = async (props: UpdateProfileProps) =>
    wrapSupabase<UpdateProfileProps, Promise<boolean>>({
      fn: _updateProfile,
      args: props,
    });

  const _updateProfile = async (newData: UpdateProfileProps) => {
    const session = useAuth.session;
    if (!session?.user) throw new Error("No user on the session!");
    const payload = {
      ...newData,
      id: newData.id ?? session.user.id,
      updated_at: new Date(),
    };

    const { error } = await supabase.from("profiles").upsert(payload);
    if (error) throw error;
    return true;
  };

  return {
    loading,
    error,
    signUp,
    signIn,
    signOut,
    loginWithToken,
    updatePassword,
    resetPassword,
    uploadAvatar,
    downloadAvatar,
    updateProfile,
  };
}

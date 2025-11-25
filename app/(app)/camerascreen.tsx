import { useState } from "react";
import Camera from "@/components/Camera";
import { View, Text } from "react-native";
import { Stack, router } from "expo-router";
import { useFetchImage } from "@/hooks/useFetchImage";
import { useSupabase } from "@/hooks/useSupabase";

export default function CameraScreen() {
  const [uri, setUri] = useState<string | undefined>(undefined);
  const { uploadAvatar: supabaseUpload, updateProfile } = useSupabase();
  const { loading, fetchImageForUpload } = useFetchImage();

  const handleUpload = async (filePath: string) => {
    try {
      setUri(filePath);
      const rawUploadData = await fetchImageForUpload({
        uri: filePath,
      });
      const data = await supabaseUpload(rawUploadData);
      await updateProfile({ avatar_url: data.path });
      router.push("/home");
    } catch (err) {
      console.error("CameraScreen err", err);
    }
  };

  if (loading || uri)
    return (
      <View>
        <Text>loading...</Text>
      </View>
    );

  return (
    <>
      <Stack.Screen options={{ title: "Camera" }} />
      <Camera onUpload={handleUpload} />
    </>
  );
}

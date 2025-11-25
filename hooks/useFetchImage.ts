import { useState } from "react";
import * as ImagePicker from "expo-image-picker";

export function useFetchImage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  interface FetchImageForUploadProps {
    uri: string;
    image?: Blob | ImagePicker.ImagePickerAsset;
  }

  const fetchImageForUpload = async ({
    uri,
    image,
  }: FetchImageForUploadProps) => {
    if (!uri) throw new Error("fetchImageForUpload: no image uri!");

    try {
      setError(null);
      setLoading(true);

      const arrayBuffer = await fetch(uri).then((res) => res.arrayBuffer());

      let blob = image;
      if (!image) blob = await fetch(uri).then((res) => res.blob());

      if (!blob)
        throw new Error("fetchImageForUpload: no image blob available");

      const fileExt = uri?.split(".").pop()?.toLowerCase() ?? "jpeg";
      const path = `${Date.now()}.${fileExt}`;

      return { path, arrayBuffer, image: blob };
    } catch (err) {
      console.error(err);
      if (err instanceof Error) setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    fetchImageForUpload,
  };
}

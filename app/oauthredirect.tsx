import { useEffect } from "react";
import { useRouter } from "expo-router";

export default function OAuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/(tabs)/home");
  }, []);

  return null;
}
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import * as AuthSession from 'expo-auth-session';
import { useEffect, useState } from "react";
import { signInWithCredential, GoogleAuthProvider } from "firebase/auth";
import { auth } from "./firebase";
import { useRouter } from "expo-router";

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    responseType: 'token',
    scopes: ["openid", "profile", "email"],
  });

  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (response?.type === "success") {
      setLoading(true);
      const accessToken =
        response.authentication?.accessToken ?? response.params?.access_token;

      if (!accessToken) {
        console.error("Google sign in error: missing accessToken in auth response");
        return;
      }

      const credential = GoogleAuthProvider.credential(null, accessToken);

      signInWithCredential(auth, credential)
        .then(() => {
          console.log("Google sign in success");
          router.replace('/(tabs)/home');
        })
        .catch((err) => {
          console.error("Google sign in error:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [response]);

  return { loading, promptAsync, request };
};

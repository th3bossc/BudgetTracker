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
    responseType: 'id_token',
    scopes: ["openid", "profile", "email"],
  });

  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (response?.type === "success") {
      setLoading(true);
      const idToken =
        response.params?.id_token ?? response.authentication?.idToken;
      if (!idToken) {
        console.error("Google sign in error: missing idToken in auth response");
        return;
      }

      const credential = GoogleAuthProvider.credential(idToken);

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

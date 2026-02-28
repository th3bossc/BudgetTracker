import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { useEffect } from "react";
import { signInWithCredential, GoogleAuthProvider } from "firebase/auth";
import { auth } from "./firebase";
import { useRouter } from "expo-router";
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const redirectUri = makeRedirectUri({
    path: 'oauthredirect',
  });

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    redirectUri,
  });

  const router = useRouter();

  console.log("hello", request?.redirectUri)

  useEffect(() => {
    if (response?.type === "success") {
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
        });
    }
  }, [response]);

  return { promptAsync, request };
};

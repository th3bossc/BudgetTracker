import { useContext } from "react";
import {
  User,
} from "firebase/auth";
import { AuthContext } from "@/providers/auth-provider";

export const useAuth = () => useContext(AuthContext);
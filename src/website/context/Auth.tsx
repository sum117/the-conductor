import {createContext} from "react";
import {UserPrisma} from "../hooks/useUser";

interface AuthContext {
  user: UserPrisma | null;
  setUser: (user: UserPrisma | null) => void;
}

export const AuthContext = createContext<AuthContext>({
  user: null,
  setUser: () => {},
});

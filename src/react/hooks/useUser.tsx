import {Prisma} from "@prisma/client";
import {useState} from "react";
import useLocalStorage from "./useLocalStorage";

export type UserPrisma = Prisma.UserGetPayload<{include: {characters: true; messages: true; heartedMessages: true; npcs: true}}>;

export default () => {
  const [user, setUser] = useState<UserPrisma | null>(null);
  const {setItem} = useLocalStorage();

  const addUser = (user: UserPrisma) => {
    setItem("user", JSON.stringify(user));
    setUser(user);
  };

  const removeUser = () => {
    setUser(null);
    setItem("user", "");
  };

  return {user, addUser, removeUser, setUser};
};

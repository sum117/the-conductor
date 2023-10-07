import {useEffect} from "react";
import useUser, {UserPrisma} from "./useUser";

export default () => {
  const {user, addUser, removeUser, setUser} = useUser();

  const removeCookie = (name: string, path = "/", domain: string) => {
    let cookieString = `${name}=; Path=${path}; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    if (domain) {
      cookieString += ` Domain=${domain};`;
    }
    document.cookie = cookieString;
  };

  const login = async (code: string) => {
    const response = await fetch(`discord/callback?code=${code}`);
    const json = (await response.json()) as UserPrisma;
    addUser(json);
  };

  const logout = () => {
    removeCookie("token", "/discord", new URL(Bun.env.WEBSITE_BASE_URL!).hostname);
    removeUser();
  };

  useEffect(() => {
    if (!user) {
      const user = localStorage.getItem("user");
      if (user) addUser(JSON.parse(user) as UserPrisma);
    }
    fetch(`discord/check`).then((response) => !response.ok && logout());
    const code = window.location.search.split("code=")?.[1];
    if (code) login(code).then(() => window.history.replaceState({}, "", "/website"));
  }, []);

  return {user, logout, setUser};
};

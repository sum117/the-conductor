import {useEffect, useState} from "react";

export default () => {
  const [theme, setTheme] = useState("dark");
  const colorTheme = theme === "light" ? "dark" : "light";

  const setMode = (mode: "light" | "dark") => {
    window.localStorage.setItem("theme", mode);
    setTheme(mode);
  };

  const toggleTheme = () => {
    if (theme === "light") setMode("dark");
    else setMode("light");
  };

  useEffect(() => {
    const localTheme = localStorage.getItem("theme");

    if (localTheme) setTheme(localTheme);
    else setMode("dark");

    const body = document.querySelector("body");
    if (!body) return;

    body.classList.remove(theme);
    body.classList.add(colorTheme);
  }, [theme, colorTheme]);

  return {colorTheme, toggleTheme} as const;
};

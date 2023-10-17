import {useEffect, useRef} from "react";

export default () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const navbar = document.getElementById("navbar")?.getBoundingClientRect();
    const element = containerRef.current;

    if (element && navbar) {
      element.style.height = `calc(100svh - ${navbar.height}px)`;
    }
  }, []);

  return {containerRef};
};

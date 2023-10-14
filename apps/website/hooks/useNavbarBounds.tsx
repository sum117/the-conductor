import {useEffect, useRef} from "react";

export default () => {
  const navbar = document.getElementById("navbar")?.getBoundingClientRect();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !navbar) return;
    containerRef.current.style.height = `calc(100svh - ${navbar.height}px)`;
  }, [navbar]);

  return {containerRef};
};

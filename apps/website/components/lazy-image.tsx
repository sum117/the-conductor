import {cva} from "class-variance-authority";
import {useEffect, useRef, useState} from "react";
import {cn} from "../lib/utils";

const LazyImageVariants = cva(
  "relative bg-cover bg-no-repeat bg-center before:bg-primary before:bg-cover before:bg-center before:bg-no-repeat before:absolute before:inset-0 before:content-['']",
  {
    variants: {
      variant: {
        default: "before:animate-pulse2",
        loaded: "before:animate-none before:content-none",
      },
      defaultVariants: {
        variant: "default",
      },
    },
  },
);

export default function LazyImage({
  className,
  placeholderSrc,
  src,
  alt,
  width,
  height,
  rounded,
  cover,
}: {
  cover?: boolean;
  rounded?: boolean;
  src: string;
  alt: string;
  className?: string;
  placeholderSrc?: string;
  width?: number;
  height?: number;
}) {
  const image = useRef<HTMLImageElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const currentImage = image.current;
    if (currentImage?.complete) setLoaded(true);
    else currentImage?.addEventListener("load", () => setLoaded(true));
    return () => {
      currentImage?.removeEventListener("load", () => setLoaded(true));
    };
  }, []);

  return (
    <div
      className={cn(
        LazyImageVariants({
          variant: loaded ? "loaded" : "default",
          className: [placeholderSrc ? `bg-[url('${placeholderSrc}')]` : "", className, rounded ? "rounded-md" : ""],
        }),
      )}
    >
      <img
        src={src}
        alt={alt}
        className={cn(
          rounded ? "rounded-md" : "",
          loaded ? "opacity-100" : "opacity-0",
          "transition-opacity duration-1000",
          cover ? "h-full w-full object-cover object-center" : "",
        )}
        loading="lazy"
        width={width}
        height={height}
        ref={image}
      />
    </div>
  );
}

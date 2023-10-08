import {clsx, type ClassValue} from "clsx";
import {twMerge} from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function removeCookie(name: string, path = "/", domain: string) {
  let cookieString = `${name}=; Path=${path}; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
  if (domain) {
    cookieString += ` Domain=${domain};`;
  }
  document.cookie = cookieString;
}

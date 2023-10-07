import {clsx, type ClassValue} from "clsx";
import {twMerge} from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getSafeKeys<T extends object>(obj: T) {
  return Object.keys(obj) as (keyof T)[];
}
export function hasKey<T>(obj: T, key: string | number | symbol): key is keyof T {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

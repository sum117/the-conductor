export function getSafeKeys<T extends object>(obj: T) {
  return Object.keys(obj) as (keyof T)[];
}
export function hasKey<T>(obj: T, key: string | number | symbol): key is keyof T {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

export function cleanImageUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.origin + parsedUrl.pathname;
  } catch {
    console.error("Invalid URL provided:", url);
    return null;
  }
}

export * from "./credentials";

export {};

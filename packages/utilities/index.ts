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

export function getSafeEntries<T extends object>(obj: T) {
  return Object.entries(obj) as [keyof T, T[keyof T]][];
}
export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function chunkify(text: string, chunkSize: number) {
  const chunks = [];

  let index = 0;
  while (index < text.length) {
    let end = index + chunkSize;

    while (end > index && text[end] !== "\n") {
      end--;
    }

    if (end === index) {
      end = index + chunkSize;
    }

    const chunk = text.substring(index, end);
    chunks.push(chunk);
    index = end;
  }

  return chunks;
}

export * from "./credentials";
export {};

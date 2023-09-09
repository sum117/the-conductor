export function cleanImageUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.origin + parsedUrl.pathname;
  } catch {
    console.error("Invalid URL provided:", url);
    return null;
  }
}

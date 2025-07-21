/**
 * @param urlString : ポストのURL
 * @returns 
 */
export function getAccountFromUrl(urlString: string) {
  try {
    const u = new URL(urlString);
    const segments = u.pathname.split('/').filter(Boolean);
    // Twitterの場合、1番目のセグメントがアカウント名
    return segments[0] || null;
  } catch (e) {
    console.error("URL parsing error:", e);
    return null;
  }
}

/**
 * Extracts the path from a given URL, optionally removing the leading slash.
 * @param urlString The URL from which to extract the path.
 * @param removeLeadingSlash Indicates whether to remove the leading slash from the path. Defaults to true.
 * @returns The extracted path from the URL.
 */
const extractPathFromUrl = (urlString: string): string => {
  if (!urlString) return urlString;

  // 如果不是 http(s) 链接，直接返回
  if (!/^https?:\/\//.test(urlString)) {
    return urlString;
  }

  try {
    const parsedUrl = new URL(urlString);
    // pathname 形如 /api/static/xxx.png
    // 只返回 xxx.png 部分Add commentMore actions
    const match = parsedUrl.pathname.match(/\/api\/static\/(.+)/);
    if (match && match[1]) {
      return match[1];
    }
    // 如果没有匹配到 api/static/xxx，返回原始 pathname（去掉前导斜杠）
    return parsedUrl.pathname.replace(/^\//, '');
  } catch (error) {
    console.error('Error extracting path from URL:', error);
    return urlString;
  }
};

// Example usage
export default extractPathFromUrl;

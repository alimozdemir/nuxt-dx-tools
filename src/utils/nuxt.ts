import { posix } from "path";
export function nuxtLayoutPathToKey(layoutPath: string) {
  // Normalize the path to ensure consistency across different operating systems
  const normalizedPath = posix.normalize(layoutPath);

  // Remove the leading slash, replace slashes with hyphens, and remove the file extension
  return normalizedPath.replace(/^\//, '').replace(/\//g, '-').replace(/\.[^/.]+$/, '');
}
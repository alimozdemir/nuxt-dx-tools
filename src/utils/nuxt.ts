import { posix, extname } from "path";
import { kebabCase } from "scule";

export function nuxtLayoutPathToKey(layoutPath: string) {
  // Normalize the path to ensure consistency across different operating systems
  const normalizedPath = posix.normalize(layoutPath);

  const pathWithoutExt = normalizedPath.slice(1, -posix.extname(normalizedPath).length);

  return kebabCase(pathWithoutExt);
}
import { posix, basename, extname } from "path";
import { kebabCase } from "scule";

export function nuxtLayoutPathToKey(layoutPath: string) {
  // Normalize the path to ensure consistency across different operating systems
  const normalizedPath = basename(posix.normalize(layoutPath), extname(layoutPath));
  
  return kebabCase(normalizedPath);
}
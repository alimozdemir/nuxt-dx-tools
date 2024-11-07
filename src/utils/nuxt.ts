import { posix } from "path";
import { kebabCase } from "scule";

export function nuxtLayoutPathToKey(layoutPath: string) {
  // Normalize the path to ensure consistency across different operating systems
  const normalizedPath = posix.normalize(layoutPath);
  
  return kebabCase(normalizedPath);
}
import { NuxtKeyFile } from "../types/nuxt";
import { NuxtProject } from "./nuxt.project";

export class NuxtTraverser {

  getAllLayouts(project: NuxtProject) {
    const result: NuxtKeyFile[] = [];

    for (const layout of project.layouts) {
      result.push(layout);
    }
    
    for (const extend of project.extends) {
      result.push(...this.getAllLayouts(extend));
    }

    return result;
  }

  getAllMiddlewares(project: NuxtProject) {
    const result: NuxtKeyFile[] = [];

    for (const middleware of project.middlewares) {
      result.push(middleware);
    }
    
    for (const extend of project.extends) {
      result.push(...this.getAllMiddlewares(extend));
    }

    return result;
  }
}
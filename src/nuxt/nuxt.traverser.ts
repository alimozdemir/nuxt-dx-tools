import { NuxtLayout } from "../types/nuxt";
import { NuxtProject } from "./nuxt.project";

export class NuxtTraverser {

  getAllLayouts(project: NuxtProject) {
    const result: NuxtLayout[] = [];

    for (const layout of project.layouts) {
      result.push(layout);
    }
    
    for (const extend of project.extends) {
      result.push(...this.getAllLayouts(extend));
    }

    return result;
  }

}
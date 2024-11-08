import { NuxtKeyFile } from "../types/nuxt";
import { fileExists, folderExists, getFiles, joinPath, resolvePath } from "../utils/file";
import { nuxtLayoutPathToKey } from "../utils/nuxt";
import { NuxtConfigParser } from "./nuxt.config.parser";
import { Watcher } from "../watcher/watcher";

export class NuxtProject {
  get version() {
    return this.nuxtConfig?.version || 3;
  }

  // extends of the project
  extends: NuxtProject[] = [];

  // path of layouts
  layouts: NuxtKeyFile[] = [];

  // path of middleware
  middlewares: NuxtKeyFile[] = [];

  ext = {
    vue: '.vue',
    ts: '.ts'
  }

  private nuxtConfig?: NuxtConfigParser;

  constructor(private nuxtPath: string, private watcher: Watcher) {
  }

  async run(): Promise<boolean> {
    // main entry point
    const configFile = joinPath(this.nuxtPath, 'nuxt.config.ts');

    if (!await fileExists(configFile)) {
      return false;
    }

    this.nuxtConfig = new NuxtConfigParser(configFile);

    await this.nuxtConfig.parse();

    this.watchAndScan('layout');
    this.watchAndScan('middleware');

    for (const extend of this.nuxtConfig.extends) {
      const path = resolvePath(this.nuxtPath, extend);
      const nuxtProject = new NuxtProject(path, this.watcher);
      if (await nuxtProject.run()) {
        this.extends.push(nuxtProject);
      }
    }

    return true;
  }

  private async watchAndScan(key: 'layout' | 'middleware') {
    if (!this.nuxtConfig) {
      return;
    }

    if (key === 'layout') {
      this.layouts = [];
      this.watchAndScanLayouts('/layouts');

      // Not sure about this behavior, when the version is 4, the layouts are on /app/layouts
      // but it looks like nuxt still looking for both paths
      if (this.version === 4) {
        this.watchAndScanLayouts('/app/layouts');
      }
    } else if (key === 'middleware') {

      this.watchAndScanMiddlewares('/middleware');

      // Not sure about this behavior, when the version is 4, the layouts are on /app/layouts
      // but it looks like nuxt still looking for both paths
      if (this.version === 4) {
        this.watchAndScanMiddlewares('/app/middleware');
      }
    }
  }
  private watchAndScanMiddlewares(folder: string) {
    this.watcher.watchFolder(joinPath(this.nuxtPath, folder), async (uri) => {
      const result: Array<{ fullPath: string, path: string }> = [];
      result.push(...await this.findFiles(folder, this.ext.ts));
      for (const file of result) {
        this.middlewares.push({
          key: nuxtLayoutPathToKey(file.path),
          path: file.fullPath
        });
      }
    }, {
      immediate: true,
      recursive: true,
      debounceWait: 200
    });
  }

  private watchAndScanLayouts(folder: string) {
    this.watcher.watchFolder(joinPath(this.nuxtPath, folder), async (uri) => {
      const result: Array<{ fullPath: string, path: string }> = [];
      result.push(...await this.findFiles(folder, this.ext.vue));
      for (const file of result) {
        this.layouts.push({
          key: nuxtLayoutPathToKey(file.path),
          path: file.fullPath
        });
      }
    }, {
      immediate: true,
      recursive: true,
      debounceWait: 200
    });
  }

  private async findFiles(folder: string, ext: string): Promise<Array<{ fullPath: string, path: string }>> {
    const p = joinPath(this.nuxtPath, folder);

    if (!await folderExists(p)) {
      return [];
    }

    const result: Array<{ fullPath: string, path: string }> = [];

    const files = await getFiles(p, ext);

    for (const file of files) {
      result.push({
        fullPath: file,
        path: file.replace(p, '')
      });
    }

    return result;
  }



}
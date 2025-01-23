import type ts from 'typescript/lib/tsserverlibrary';
import { LanguageServiceProxyBuilder } from './proxy';

const pluginModuleFactory: ts.server.PluginModuleFactory = ({ typescript }) => {
  
  function create(info: ts.server.PluginCreateInfo): ts.LanguageService {
    const logger = (msg: string) => info.project.projectService.logger.info(`[nuxt-dx-tools-plugin] ${msg}`);

    logger('Creating ts plugin');

    const proxy = new LanguageServiceProxyBuilder(info)
      .wrap('getDefinitionAndBoundSpan', (delegate) => (fileName, position) => { 
          const all = delegate(fileName, position);

          if (!all) return all;

          const haveMultiple = (all.definitions?.length ?? 0) > 1;

          if (haveMultiple && all.definitions?.some(s => s.fileName.endsWith(".d.ts"))) {
            return {
              textSpan: all.textSpan,
              definitions: all.definitions.filter(s => !s.fileName.endsWith(".d.ts"))
            };
          }

          return all;
      })
      .build();

    return proxy;
  }

  return { create };
};

export = (mod: { typescript: typeof ts }) => {
  return pluginModuleFactory(mod);
}

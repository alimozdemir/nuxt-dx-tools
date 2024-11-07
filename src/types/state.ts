import { OutputChannel } from 'vscode';
import { ConfigurationService } from '../utils/configuration';
import { NuxtProject } from '../nuxt/nuxt.project';

export interface State {
    commandCall: boolean;
    log: OutputChannel;
    extensionId: string;
    extensionName: string;
    workspaceRoot?: string;
    nuxtFolder?: string;
    nuxtDotFolder?: string;
    nitroRoutes?: string;
    config: ConfigurationService;

    nuxtProject?: NuxtProject;
}
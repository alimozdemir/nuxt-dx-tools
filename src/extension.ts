import { State } from './types/state';
import { ConfigurationService, prompt } from './utils/configuration';
import { getNuxtFolder, joinPath } from './utils/file';
import { ApiHoverProvider } from './hover/api.hover';
import { MainProvider } from './definition/main';
import { workspace, ExtensionContext, window, languages, DocumentSelector, Disposable } from 'vscode';
import { NuxtProject } from './nuxt/nuxt.project';

const extensionName = 'Nuxt DX Tools';
const extensionId = 'vscode-nuxt-dx-tools';
const nitroRoutes = 'types/nitro-routes.d.ts';

function getWorkspaceRoot(): string | undefined {
	const workspaceFolders = workspace.workspaceFolders;
	if (workspaceFolders && workspaceFolders.length > 0) {
		return workspaceFolders[0].uri.fsPath;
	}
	return undefined;
}

export function activate(context: ExtensionContext) {

	const state: State = {
		commandCall: false,
		config: new ConfigurationService(),
		log: window.createOutputChannel(extensionName),
		extensionId: extensionId,
		extensionName
	};

	console.log(`${state.extensionName} is now actived (${state.extensionId})`);

	const selectors : DocumentSelector = [
		{ scheme: 'file', language: 'javascript' },
		{ scheme: 'file', language: 'typescript' },
		{ scheme: 'file', language: 'javascriptreact' },
		{ scheme: 'file', language: 'typescriptreact' },
		{ scheme: 'file', language: 'vue' }
	];

	prompt(extensionName, context);

	const config = workspace.getConfiguration();

	config.update('editor.gotoLocation.multipleDefinitions', 'goto');
	const workspaceRoot = getWorkspaceRoot();

	if (workspaceRoot) {
		state.workspaceRoot = workspaceRoot;

		getNuxtFolder(state.workspaceRoot).then((folder) => {
			state.nuxtFolder = folder;
			state.nuxtDotFolder = folder ? joinPath(folder, '.nuxt') : undefined;
			state.nitroRoutes = state.nuxtDotFolder ? joinPath(state.nuxtDotFolder, nitroRoutes) : undefined;

			if (state.nuxtFolder) {
				state.nuxtProject = new NuxtProject(state.nuxtFolder);
				state.nuxtProject.run();
			}	
			
		});
	}

	state.log.appendLine(`${state.extensionName} is now actived (${state.extensionId})`);

	const definitionProvider = languages.registerDefinitionProvider(selectors, new MainProvider(state));

	const hoverProvider = new ApiHoverProvider(state);
	let hover: Disposable | undefined;

	if (state.config.get<boolean>('api.hover.enable')) {
		hover = languages.registerHoverProvider(selectors, hoverProvider);
		context.subscriptions.push(hover);
	}

	const watchDisposable = state.config.watch<boolean>('api.hover.enable', (value) => {
		if (!value) {
			if (hover) {
				hover.dispose();
				hover = undefined;
			}
		} else {
			if (!hover) {
				hover = languages.registerHoverProvider(selectors, hoverProvider);
				context.subscriptions.push(hover);
			}
		}
	});

	context.subscriptions.push(state.log, state.config, watchDisposable, definitionProvider);
	console.log(`${state.extensionName} is now ready to use!`);
}

// This method is called when your extension is deactivated
export function deactivate() {
	console.log(`Your extension "${extensionId}" is now deactivated!`);
}

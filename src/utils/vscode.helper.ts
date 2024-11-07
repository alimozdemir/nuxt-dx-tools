import { TextDocument, Position, commands, LocationLink } from 'vscode';
import { State } from '../types/state';

export async function defaultProvider(state: State, document: TextDocument, position: Position) {
    state.commandCall = true;
    const definitions = await commands.executeCommand<LocationLink[]>(
        'vscode.executeDefinitionProvider',
        document.uri,
        position
    );
    state.commandCall = false;
    return definitions;
  }
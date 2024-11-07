import { CancellationToken, Definition, DefinitionLink, DefinitionProvider, Location, Position, TextDocument } from "vscode";
import { State } from "../types/state";
import { dTsDefinitionProvider } from "./dTs.definition";
import { defaultProvider } from "../utils/vscode.helper";
import { ApiDefinitionProvider } from "./api.definition";
import { FunctionDefinitionProvider } from "./function/function.definition";

export class MainProvider implements DefinitionProvider {

  private dTsProvider: dTsDefinitionProvider;
  private fnProvider: FunctionDefinitionProvider;
  
  constructor(private state: State) {
    this.dTsProvider = new dTsDefinitionProvider(state);
    this.fnProvider = new FunctionDefinitionProvider(state);
  }

  async provideDefinition(document: TextDocument, position: Position, token: CancellationToken): Promise<Definition | DefinitionLink[] | undefined> {

    if (this.state.commandCall) { return; }

    const range = document.getWordRangeAtPosition(position);
    const objectName = document.getText(range);

    this.state.log.appendLine("Looking for definition: " + objectName);

    const result: Location[] = [];

    const defaultDef = await defaultProvider(this.state, document, position);

    try {
      if (defaultDef && defaultDef.length > 0) {
        for (const def of defaultDef) {
          if (def.targetUri.path.endsWith('.d.ts')) {
            const dTsResult = await this.dTsProvider.run(def);
            result.push(...dTsResult);
          }
        }
      } else {
        const fnResult = await this.fnProvider.run(document, position, token);
        if (fnResult) {
          result.push(...fnResult);
        }
      }
    } catch (error) {
      console.error(error);
      this.state.log.appendLine('error: ' + error);
    }

    return result;

  }
}

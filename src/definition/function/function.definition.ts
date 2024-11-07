import { createSourceFile, ScriptTarget } from "typescript";
import { TextDocument, Position, CancellationToken, Location } from "vscode";
import { findAssignment, findFunctionNearest } from "../../utils/node";
import { ApiDefinitionProvider } from "./api.definition";
import { State } from "../../types/state";
import { FunctionResult } from "../../types/function.result";
import { FunctionProvider } from "../../types/function.provider";
import { MetaDefinitionProvider } from "./meta.definition";

export class FunctionDefinitionProvider {
  providers: FunctionProvider[] = [];

  constructor(private state: State) {
    this.providers.push(
      new ApiDefinitionProvider(state),
      // new MetaDefinitionProvider(state)
    );
  }

  async run(document: TextDocument, position: Position, token: CancellationToken): Promise<Location[] | undefined> {
    const fn = await this.fnFinder(document, position);

    if (!fn) {
      return;
    }

    for (const provider of this.providers) {
      if (!provider.functions.includes(fn.name))
        continue;

      this.state.log.appendLine(`Running ${fn.name} provider`);

      const result = await provider.run(fn);

      if (result) {
        return result;
      }
    }
  }
  
  fnFinder(document: TextDocument, position: Position) : FunctionResult | undefined {
    const wordRange = document.getWordRangeAtPosition(position);

    if (!wordRange) {
      return;
    }
  
    const lookingFor = document.getText(wordRange);
  
    if (!lookingFor) {
      return;
    }
  
    const sourceFile = createSourceFile(
      document.fileName,
      document.getText(),
      ScriptTarget.Latest,
      true
    );

    const offset = document.offsetAt(position);
    const foundNode = findFunctionNearest(sourceFile, offset);

    return foundNode ? {
      name: foundNode.expression.getText(),
      focusedText: lookingFor,
      documentPath: document.uri.fsPath,
      sourceFile: sourceFile,
      offset,
      node: foundNode
    } : undefined;
  }
}
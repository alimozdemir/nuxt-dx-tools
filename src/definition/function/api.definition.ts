import { Location, Disposable, Range, Position, Uri } from "vscode";
import { FunctionProvider } from "../../types/function.provider";
import { isObjectLiteralExpression, isStringLiteral, ObjectLiteralExpression } from "typescript";
import { State } from "../../types/state";
import { normalizePath } from "../../api/normalize-path";
import { ApiResult } from "../../types/api.result";
import { nitroRoutesParser } from "../../api/nitro/nitro-routes.parser";
import { FunctionResult } from "../../types/function.result";
import { buildPath, findFile } from "../../utils/file";

export class ApiDefinitionProvider implements FunctionProvider {
  functions: string[];
  disposables: Disposable[] = [];

  constructor(private state: State) {
    this.functions = state.config.get<Array<string>>('api.functions') || [];
    
    this.disposables.push(
      this.state.config.watch<Array<string>>('api.functions', (value) => {
        this.functions = value || [];
      })
    )
  }

  async run(fn: FunctionResult): Promise<Location[] | undefined> {
    if (!this.state.nitroRoutes)
      return;

    const api = this.extractPath(fn);
    if (!api) {
      return;
    }

    const result = await nitroRoutesParser(this.state.nitroRoutes, api);

    if (result) {
      const fullPath = buildPath(fn.documentPath, result.path, this.state.workspaceRoot);
      const file = await findFile(fullPath, ['.ts', '.js']);

      this.state.log.appendLine(`Hovering over ${api.path} at ${fullPath}`);
      
      if (!file) {
        return;
      }

      this.state.log.appendLine("Absolute path:" + file);

      return [{
          range: new Range(new Position(0, 0), new Position(0, 0)),
          uri: Uri.file(file),
      }];
    }
    
  }

  private extractPath(fn: FunctionResult): ApiResult | undefined {
    if (fn.node && fn.node.arguments.length > 0) {
      // we will have the complete fetch call code
      const arg = fn.node.arguments[0];
      const argText = arg.getText();
  
      let method: string | undefined = undefined;
  
      // try to find the method
      if (fn.node.arguments.length > 1) {
        const secondArg = fn.node.arguments[1];
        if (isObjectLiteralExpression(secondArg)) {
          const object: ObjectLiteralExpression = secondArg;
  
          const propMethod = object.properties
            .find(i => i.name?.getText() === 'method');
  
          if (propMethod) {
            const value = propMethod.getChildren().find(i => isStringLiteral(i));
            if (value) {
              method = value.text;
            }
          }
        }
      }
  
      if (argText.includes(fn.focusedText)) {
        return {
          originalPath: argText,
          path: normalizePath(arg, fn.sourceFile),
          method
        };
      }
    }
  }

  dispose() {
    this.disposables.forEach(disposable => disposable.dispose());
    this.disposables = [];
  }
}
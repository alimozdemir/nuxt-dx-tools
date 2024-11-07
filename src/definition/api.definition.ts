import { TextDocument, Position, CancellationToken, Range, Uri, Location } from "vscode";
import { State } from "../types/state";
import { nitroRoutesParser } from "../api/nitro/nitro-routes.parser";
import { correlatePath, findFile } from "../utils/file";
import { apiDetector } from "../api/api.detector";

export class ApiDefinitionProvider {

  constructor(private state: State) {
  }

  async run(document: TextDocument, position: Position, token: CancellationToken): Promise<Location[] | undefined> {
    if (!this.state.nitroRoutes)
      {return;}

    const isApi = apiDetector(this.state, document, position);
    
    if (isApi) {
      const result = await nitroRoutesParser(this.state.nitroRoutes, isApi);
      if (result) {

        const fullPath = correlatePath(document, result.path, this.state.workspaceRoot);
        const file = await findFile(fullPath, ['.ts', '.js']);

        this.state.log.appendLine(`Hovering over ${isApi.path} at ${fullPath}`);
        
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

    return;
  }

}
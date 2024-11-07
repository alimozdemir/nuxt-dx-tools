import { HoverProvider, TextDocument, Position, CancellationToken, ProviderResult, Hover, workspace, Range, Uri, MarkdownString } from "vscode";
import { State } from "../types/state";
import { nitroRoutesParser } from "../api/nitro/nitro-routes.parser";
import { correlatePath, findFile } from "../utils/file";
import { apiDetector } from "../api/api.detector";

export class ApiHoverProvider implements HoverProvider {
  constructor(private state: State) {
  }

  async provideHover(document: TextDocument, position: Position, token: CancellationToken): Promise<Hover | undefined> {
    let hover: Hover | undefined;

    if (!this.state.nitroRoutes)
      {return hover;}

    const isApi = apiDetector(this.state, document, position);
    
    if (isApi) {

      this.state.log.appendLine(`Hovering over ${isApi.path}`);

      const result = await nitroRoutesParser(this.state.nitroRoutes, isApi);
      if (result) {
        const fullPath = correlatePath(document, result.path, this.state.workspaceRoot);
        const file = await findFile(fullPath, ['.ts', '.js']);

        if (!file) {
          return;
        }

        this.state.log.appendLine(`Hovering over ${isApi.path} at ${file}`);

        const hoverDoc = await workspace.openTextDocument(file);
        const md = new MarkdownString();
        
        md.appendCodeblock(hoverDoc.getText(new Range(new Position(0, 0), new Position(3, 100))), 'typescript');

        return new Hover(md);
      }
    }


    return hover;
  }
}
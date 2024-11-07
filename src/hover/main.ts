import { HoverProvider, TextDocument, Position, CancellationToken, ProviderResult, Hover, workspace, Range, Uri, MarkdownString, Location } from "vscode";
import { State } from "../types/state";
import { FunctionDefinitionProvider } from "../functions/function.definition";

export class MainHoverProvider implements HoverProvider {
  fnProvider: FunctionDefinitionProvider;

  constructor(private state: State) {
    this.fnProvider = new FunctionDefinitionProvider(state);
  }

  async provideHover(document: TextDocument, position: Position, token: CancellationToken): Promise<Hover | undefined> {
    let hover: Hover | undefined;

    const fnResult = await this.fnProvider.run(document, position, token);

    if (fnResult) {
      const doc = await this.doc(fnResult[0]);
      hover = new Hover(doc);
    }
    
    return hover;
  }


  async doc(loc: Location) : Promise<MarkdownString> {
    const hoverDoc = await workspace.openTextDocument(loc.uri);
    const md = new MarkdownString();
    
    md.appendCodeblock(hoverDoc.getText(new Range(new Position(0, 0), new Position(3, 100))), 'typescript');

    if (hoverDoc.lineCount > 3) {
      md.appendMarkdown(`...  \n`);
    }

    md.appendMarkdown(`[Go to definition](${loc.uri.fsPath})`);

    return md;
  }
}
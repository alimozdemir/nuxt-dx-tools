import { Location, LocationLink, Position, Range, TextDocument, Uri, workspace } from "vscode";
import { State } from "../types/state";
import { correlatePath, findFile } from "../utils/file";
import { createSourceFile, isFunctionDeclaration, isImportDeclaration, isVariableDeclaration, ScriptTarget, visitEachChild, visitNode, Visitor } from "typescript";

export class dTsDefinitionProvider {
  private possibleExtensions = ['.d.ts', '.vue', '.ts', '.tsx', '.js', '.jsx'];

  constructor(private state: State) {  
  }
  
  async run(def: LocationLink) : Promise<Location[]> {
    const document = await workspace.openTextDocument(def.targetUri);
    const text = document.getText(def.targetRange);
  
    const regex = /import\(["'](.+?)["']\)\['(.*?)'\]/;
    const match = text.match(regex);
    const importPath = match ? match[1] : undefined;
    const bracketText = match ? match[2] : undefined;
  
    let result: Location[];
  
    if (importPath) {
        result = await this.inlineImport(importPath, document, bracketText);
    } else {
        result = await this.topImport(text, document);
    }
  
    return result;
  }
  
  private async inlineImport(importPath: string, document: TextDocument, pointer?: string) {
    this.state.log.appendLine("Import path:" + importPath);
  
    const result: Location[] = [];
  
    if (importPath) {
        const absoluteImportPath = correlatePath(document, importPath);
        const foundFile = await findFile(absoluteImportPath, this.possibleExtensions);
  
        this.state.log.appendLine("Absolute path:" + foundFile);
  
        if (foundFile) {
            let position = new Position(0, 0);
  
            if (pointer)
                {position = await this.findPosition(pointer, foundFile) ?? new Position(0, 0);}
            
            result.push({
                range: new Range(position, position),
                uri: Uri.file(foundFile),
            });
        }
    }
  
    return result;
  }
  
  private async topImport(text: string, document: TextDocument) {
    const result: Location[] = [];
  
    if (!text.includes(':')) {
        return result;
    }
  
    const pair = text.split(':');
  
    if (!pair || pair.length !== 2) {
        return result;
    }
  
    let typeDef = pair[1].trim();
  
    if (typeDef.endsWith(','))
        {typeDef = typeDef.slice(0, -1);}
  
    // TODO: ts.ScriptTarget.Latest might lead to issues
    const sf = createSourceFile('dummy', document.getText(), ScriptTarget.Latest);
  
    const importDeclarations = sf.statements.filter(isImportDeclaration);
    const importDec = importDeclarations.find(i => i.getText(sf).includes(typeDef));
  
    if (!importDec) {
        return result;
    }
  
    const importPath = importDec.moduleSpecifier.getText(sf).slice(1, -1);
    const absoluteImportPath = correlatePath(document, importPath);
  
    const foundFile = await findFile(absoluteImportPath, this.possibleExtensions);
  
    this.state.log.appendLine("Absolute path:" + foundFile);
  
    if (foundFile) {
        result.push({
            range: new Range(new Position(0, 0), new Position(0, 0)),
            uri: Uri.file(foundFile),
        });
    }
  
    return result;
  }

  
  private async findPosition(objectName: string, filePath: string): Promise<Position | undefined> {
    const document = await workspace.openTextDocument(filePath);
    // TODO: ts.ScriptTarget.Latest might lead to issues
    const sf = createSourceFile('dummy', document.getText(), ScriptTarget.Latest);

    let foundPosition: Position | undefined;

    const visitor: Visitor = node => {

        if (isVariableDeclaration(node)) {
            if (node.name.getText(sf) === objectName) {
                const start = node.getStart(sf);
                const position = document.positionAt(start);
                foundPosition = position;
                return;
            }
        } else if (isFunctionDeclaration(node)) {
            if (node.name?.getText(sf) === objectName) {
                const start = node.getStart(sf);
                const position = document.positionAt(start);
                foundPosition = position;
                return;
            }
        }

        return visitEachChild(node, visitor, undefined);
    };

    visitNode(sf, visitor);

    return foundPosition;
}

}



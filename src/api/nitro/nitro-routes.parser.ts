import {
  createSourceFile, ImportTypeNode, isFunctionDeclaration, isImportDeclaration, isImportTypeNode, isPropertySignature, isStringLiteral, isVariableDeclaration,
  Node, PropertySignature, ScriptTarget, SyntaxKind, visitEachChild, visitNode, Visitor
} from "typescript";
import { workspace } from "vscode";
import { correlatePath } from "../../utils/file";
import { ApiResult } from "../../types/api.result";
import { NitroResult } from "../../types/nitro.result";
import { normalizeNitroPath } from "../normalize-path";


/// <summary>
/// Parses the nitro-routes.ts file to find the path of the API.
/// </summary>
export async function nitroRoutesParser(path: string, api: ApiResult): Promise<NitroResult | undefined> {
  const document = await workspace.openTextDocument(path);

  // TODO: ts.ScriptTarget.Latest might lead to issues
  const sourceFile = createSourceFile(
    document.fileName,
    document.getText(),
    ScriptTarget.Latest,
    true
  );

  let foundApi: Node | undefined;

  const apiDefinitionVisitor: Visitor = node => {
    if (isPropertySignature(node)) {
      const assign = node.getChildAt(0);
      if (assign && isStringLiteral(assign)) {
        const normalizedPath = normalizeNitroPath(assign.text);
        if (normalizedPath === api.path) {
          foundApi = node;
          return;
        } else if (normalizedPath.includes('**')) {
          const path = normalizedPath.slice(0, assign.text.indexOf('**'));
          
          if (api.path.startsWith(path)) {
            foundApi = node;
            return;
          }
        }

      }
    }
    return visitEachChild(node, apiDefinitionVisitor, undefined);
  };

  visitNode(sourceFile, apiDefinitionVisitor);

  if (!foundApi) { return; }


  let foundProp: PropertySignature | undefined;

  let method = api.method?.toLocaleLowerCase() ?? 'get';

  const propVisitor: Visitor = node => {

    if (isPropertySignature(node)) {
      const assign = node.getChildAt(0);

      if (assign && isStringLiteral(assign)) {
        const text = assign.text.toLocaleLowerCase();
        if (text === 'default' || (method && text === method)) {
          foundProp = node;
          return;
        }
      }
    }

    return visitEachChild(node, propVisitor, undefined);
  };

  visitNode(foundApi, propVisitor);

  if (!foundProp) { return; }

  let foundImport: ImportTypeNode | undefined;

  const importVisitor: Visitor = node => {
    if (isImportTypeNode(node)) {
      foundImport = node;
      return;
    }
    return visitEachChild(node, importVisitor, undefined);
  };

  visitNode(foundProp, importVisitor);

  if (foundImport) {
    const path = foundImport.argument.getText(sourceFile)
      .replaceAll("'", "")
      .replaceAll('"', "");

    return {
      originalPath: path,
      path: correlatePath(document, path)
    };
  }

}
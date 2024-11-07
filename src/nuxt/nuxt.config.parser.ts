import { CallExpression, createSourceFile, isArrayLiteralExpression, 
  isNumericLiteral, 
  isObjectLiteralExpression, isStringLiteral, ScriptTarget, SyntaxKind } from "typescript";
import { workspace } from "vscode";
import { findFunction, findProperty } from "../utils/node";

export class NuxtConfigParser {
  // path of extends
  extends: string[] = [];

  version: 3 | 4 = 3;



  constructor(private configPath: string) {
  }

  async parse() {
    const textDocument = await workspace.openTextDocument(this.configPath);

    const configFile = createSourceFile(this.configPath, textDocument.getText(), ScriptTarget.Latest, true);

    const defaultExport = findFunction(configFile, ['defineNuxtConfig']);

    if (!defaultExport) return;

    this.parseExtends(defaultExport);
    
    this.parseVersion(defaultExport);
    
  }

  // TODO: later this will be checked by package.json as well
  // When nuxt 4 released, this will be updated
  private parseVersion(defineNuxtConfig: CallExpression) {

    const version = this.parseFutureCompatibilityVersion(defineNuxtConfig);

    if (version) {
      this.version = version;
    }
    
  }

  private parseFutureCompatibilityVersion(defineNuxtConfig: CallExpression) {
    const prop = findProperty(defineNuxtConfig.arguments[0], 'future');
    
    if (!prop) return;

    const futureObject = prop.getChildren().find(c => isObjectLiteralExpression(c));
    
    if (!futureObject) return;

    const version = findProperty(futureObject, 'compatibilityVersion');

    if (!version) return;

    const value = version.getChildren().find(c => isNumericLiteral(c));

    if (!value) return;

    const parsedValue = parseInt(value.text);

    return parsedValue == 4 ? 4 : 3;
  }


  private parseExtends(defineNuxtConfig: CallExpression) {
    const prop = findProperty(defineNuxtConfig.arguments[0], 'extends');

    if (!prop) return;

    const value = prop.getChildren().find(c => isStringLiteral(c) || isArrayLiteralExpression(c));
    
    if (!value) return;

    if (isStringLiteral(value)) {
      this.extends.push(value.text);
    } else {
      const values = value.elements.filter(i => isStringLiteral(i)).map(e => e.text);
      // remove github repository links
      // TODO: investigate it later
      const pruneValues = values.filter(i => !i.includes(':'));

      this.extends.push(...pruneValues);
    }
  }

}
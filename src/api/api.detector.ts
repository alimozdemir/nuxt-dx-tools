import { TextDocument, Position } from 'vscode';
import { createSourceFile, ScriptTarget, Node, isCallExpression, 
  forEachChild, isIdentifier, CallExpression, 
  isObjectLiteralExpression,
  ObjectLiteralExpression,
  isStringLiteral} from 'typescript';
import { ApiResult } from '../types/api.result';
import { normalizePath } from './normalize-path';
import { State } from '../types/state';

/// <summary>
/// Detects the API call in the document.
/// e.g. given document and position, it will find 
/// $fetch('https://api.com'), then extract the path 'https://api.com'.
/// </summary>
export function apiDetector(state: State, document: TextDocument, position: Position) : ApiResult | undefined {
  const functionNames = state.config.get<Array<string>>('api.functions');

  if (!functionNames){
    return;
  }
  
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
  let foundNode: CallExpression | undefined;


  const findNode = (node: Node) => {
    if (offset >= node.getStart() && offset < node.getEnd()) {
      if (isCallExpression(node) && isIdentifier(node.expression) && 
        (functionNames.includes(node.expression.text))) {
        foundNode = node;
        return;
      }
      forEachChild(node, findNode);
    }
  };

  findNode(sourceFile);
  
  if (foundNode && foundNode.arguments.length > 0) {
    // we will have the complete fetch call code
    const arg = foundNode.arguments[0];
    const argText = arg.getText(sourceFile);

    let method: string | undefined = undefined;

    // try to find the method
    if (foundNode.arguments.length > 1) {
      const secondArg = foundNode.arguments[1];
      if (isObjectLiteralExpression(secondArg)) {
        const object: ObjectLiteralExpression = secondArg;

        const propMethod = object.properties
          .find(i => i.name?.getText(sourceFile) === 'method');

        if (propMethod) {
          const value = propMethod.getChildren().find(i => isStringLiteral(i));
          if (value) {
            method = value.text;
          }
        }
      }
    }

    if (argText.includes(lookingFor)) {
      return {
        originalPath: argText,
        path: normalizePath(arg, sourceFile),
        method
      };
    }
  }
}


import { Node, CallExpression, isCallExpression, forEachChild, 
  isIdentifier, isObjectLiteralExpression, Expression, ObjectLiteralExpression, ObjectLiteralElementLike, SyntaxKind, 
  isPropertyAssignment,
  PropertyAssignment} from "typescript";

export function findFunctionNearest(node: Node, offset?: number): CallExpression | undefined {

  let foundNode: CallExpression | undefined;

  const findNode = (node: Node) => {
    if (offset) {
      if (offset >= node.getStart() && offset < node.getEnd()) {
        if (isCallExpression(node) && isIdentifier(node.expression)) {
          foundNode = node;
          return;
        }
  
        forEachChild(node, findNode);
      }
    }
    else {
      if (isCallExpression(node) && isIdentifier(node.expression)) {
        foundNode = node;
        return;
      }

      forEachChild(node, findNode);
    }
  };

  findNode(node);

  return foundNode;
}

export function findAssignment(node: Node, offset?: number): PropertyAssignment | undefined {
  let foundNode: PropertyAssignment | undefined;

  const findNode = (node: Node) => {
    if (offset) {
      if (offset >= node.getStart() && offset < node.getEnd()) {
        if (isPropertyAssignment(node)) {
          foundNode = node;
          return;
        }
  
        forEachChild(node, findNode);
      }
    }
    else {
      if (isPropertyAssignment(node)) {
        foundNode = node;
        return;
      }

      forEachChild(node, findNode);
    }
  };

  findNode(node);

  return foundNode;
}

export function findFunction(node: Node, functionNames: string[], offset?: number): CallExpression | undefined {

  let foundNode: CallExpression | undefined;

  const findNode = (node: Node) => {
    if (offset) {
      if (offset >= node.getStart() && offset < node.getEnd()) {
        if (isCallExpression(node) && isIdentifier(node.expression) && functionNames.includes(node.expression.text)) {
          foundNode = node;
          return;
        }
  
        forEachChild(node, findNode);
      }
    }
    else {
      if (isCallExpression(node) && isIdentifier(node.expression) && functionNames.includes(node.expression.text)) {
        foundNode = node;
        return;
      }

      forEachChild(node, findNode);
    }
  };

  findNode(node);

  return foundNode;
}

export function findProperty(e: Expression, param: string): ObjectLiteralElementLike | undefined {
  if (!isObjectLiteralExpression(e)) {
    return;
  }

  const object: ObjectLiteralExpression = e;

  const propMethod = object.properties
    .find(i => i.name?.getText() === param);

  return propMethod;
}
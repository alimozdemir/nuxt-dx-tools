import { Node, SourceFile, isStringLiteral, 
  isNoSubstitutionTemplateLiteral, isTemplateExpression, isBinaryExpression, SyntaxKind } from "typescript";

const keyword = ':param';

export function normalizePath(node: Node, sourceFile: SourceFile): string {
  if (isStringLiteral(node) || isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }

  if (isTemplateExpression(node)) {
    let result = node.head.text;
    node.templateSpans.forEach(span => {
        result += keyword + span.literal.text;
    });
    return result;
  }

  if (isBinaryExpression(node) && node.operatorToken.kind === SyntaxKind.PlusToken) {
      const left = normalizePath(node.left, sourceFile);
      const right = normalizePath(node.right, sourceFile);
      if (left.endsWith(keyword) || right.startsWith(keyword)) {
        return left + right;
      } else {
        return left + keyword + right;
      }
  }

  return '';
}

export function normalizeNitroPath(path: string): string {
  const p = path.replace(/:([^/]+)/g, keyword);
  return p;
}
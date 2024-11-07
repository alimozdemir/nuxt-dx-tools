import { CallExpression, SourceFile } from "typescript";

export interface FunctionResult {
  name: string;
  focusedText: string;
  offset: number;
  sourceFile: SourceFile;
  documentPath: string;
  node: CallExpression;
}
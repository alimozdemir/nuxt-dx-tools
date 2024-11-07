import { CallExpression } from "typescript";
import { Location, Disposable } from "vscode";
import { FunctionResult } from "./function.result";

export interface FunctionProvider extends Disposable {
  functions: string[];
  run(fn: FunctionResult): Promise<Location[] | undefined>
}
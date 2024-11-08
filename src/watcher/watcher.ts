import { Disposable, RelativePattern, Uri, workspace } from "vscode";
import { joinPath } from "../utils/file";
import { debounce } from "../utils/debounce";

export class Watcher implements Disposable {
  
  disposables: Disposable[] = [];

  watchFolder(path: string, callback: (path: Uri) => void | Promise<void>, options: {
    immediate?: boolean,
    recursive?: boolean,
    debounceWait?: number
  }) {
    const pattern = options?.recursive ? joinPath(path, '**/*') : joinPath(path, '*');

    const watcher = workspace.createFileSystemWatcher(pattern, false, true, false);
    
    // rename is actually delete and create operations, so by debouncing we can avoid duplicated operations
    let callbackFn = options?.debounceWait ? debounce(callback, options.debounceWait) : callback;

    watcher.onDidDelete(callbackFn);
    watcher.onDidCreate(callbackFn);

    if (options?.immediate) {
      callback(Uri.file(path));
    }

    this.disposables.push(watcher);
  }
  
  dispose() {
    this.disposables.forEach(d => d.dispose());
    this.disposables = [];
  }

}
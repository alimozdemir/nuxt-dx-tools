import { Disposable, RelativePattern, Uri, workspace } from "vscode";
import { joinPath } from "../utils/file";

export class Watcher implements Disposable {
  
  disposables: Disposable[] = [];

  watchFolder(path: string, callback: (path: Uri) => void | Promise<void>, options: {
    immediate?: boolean,
    recursive?: boolean
  }) {
    
    const pattern = options?.recursive ? joinPath(path, '**/*') : joinPath(path, '*');

    const watcher = workspace.createFileSystemWatcher(pattern);

    watcher.onDidDelete(callback);
    watcher.onDidCreate(callback);

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
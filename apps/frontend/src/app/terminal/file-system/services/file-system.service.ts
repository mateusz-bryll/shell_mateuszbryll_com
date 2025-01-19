import {Injectable} from '@angular/core';
import {Directory} from '../model/directory.model';
import {OutputStringFormat} from '../model/output-string.format';
import {RequestedAccess} from '../model/permissions.model';
import {User} from '../model/user.model';
import {FileSystemApiService, SpecialFiles} from './file-system-api.service';
import {PathOperationResult} from './path-operation.result';
import {ChangeDirectoryResult} from './change-directory.result';
import {ReadFileResult} from './read-file.result';
import {FileOperationResult} from './file-operation.result';


@Injectable({
  providedIn: 'root'
})
export class FileSystemService {
  private _currentPath: string;
  private _currentNode: Directory;

  constructor(private _api: FileSystemApiService) {
    this._currentNode = this._api.getFileSystem();
    this.changeDirectory('./Resume', this._api.endOfFileSystem.permissions.user, RequestedAccess.Read);
    this._currentPath = this._getCurrentPath();
  }

  get currentPath() {
    return this._currentPath;
  }

  getCurrentDirectoryAttributes() {
    return this._currentNode.attributes;
  }

  getCurrentDirectoryContent(format: OutputStringFormat, showHiddenFiles: boolean): string {
    return this._currentNode.toContentOutputString(format, showHiddenFiles);
  }

  changeDirectory(path: string, user: User, requestedAccess: RequestedAccess): ChangeDirectoryResult {
    if (path.indexOf('~') !== -1 || path.indexOf('/') === 0) {
      return new ChangeDirectoryResult(PathOperationResult.NotSupported, undefined);
    }

    let pathParts = path.split('/').filter(x => x).reverse();

    // Change multiple directories at once
    if (pathParts.length > 1) {
      let result;
      let tmp = this._currentNode;

      do {
        result = this._changeDirectory(pathParts.pop()!, user, requestedAccess);
      } while (pathParts.length > 0 && result.pathOperationResult === PathOperationResult.Success);

      if (result.pathOperationResult !== PathOperationResult.Success) {
        this._currentNode = tmp;
        this._currentPath = this._getCurrentPath();
      }

      return result;
    } else if (pathParts.length == 1)  { // Change one directory at once
      let part = pathParts[0];
      return this._changeDirectory(part, user, requestedAccess);
    }

    return new ChangeDirectoryResult(PathOperationResult.NotFound, undefined);
  }

  getFileContent(fileName: string, user: User, requestedAccess: RequestedAccess): ReadFileResult {
    let file = this._currentNode.getChildFile(fileName);
    if (!file) {
      return new ReadFileResult(FileOperationResult.NotFound, undefined, undefined);
    }
    let accessVerificationResult = file.permissions.hasAccess(user, requestedAccess);

    if (accessVerificationResult && accessVerificationResult.isSuccess) {
      return new ReadFileResult(FileOperationResult.Success, file.content, accessVerificationResult);
    }

    return new ReadFileResult(FileOperationResult.Denied, undefined, accessVerificationResult);
  }

  getSpecialFileContent(specialFile: SpecialFiles): string {
    let file = this._api.endOfFileSystem.getChildFile(specialFile);
    return file!.content;
  }

  private _changeDirectory(pathSegment: string, user: User, requestedAccess: RequestedAccess): ChangeDirectoryResult {
    // Change directory to current directory - always success
    if (pathSegment === '.') {
      return new ChangeDirectoryResult(PathOperationResult.Success, undefined)
    }

    // Change directory to parent directory if user has access
    if (pathSegment === '..') {
      let parentDirectory = this._currentNode.getParentDirectory();
      if (!parentDirectory) {
        return new ChangeDirectoryResult(PathOperationResult.NotFound, undefined)
      }

      let accessVerificationResult = parentDirectory?.permissions.hasAccess(user,  requestedAccess);
      if (accessVerificationResult && accessVerificationResult.isSuccess ) {
        this._currentNode = parentDirectory!;
        this._currentPath = this._getCurrentPath();

        return new ChangeDirectoryResult(PathOperationResult.Success, accessVerificationResult);
      }

      return new ChangeDirectoryResult(PathOperationResult.Denied, accessVerificationResult);
    }

    // Change directory to child directory if exists and user has access
    let directory = this._currentNode.getChildDirectory(pathSegment);
    if (!directory) {
      return new ChangeDirectoryResult(PathOperationResult.NotFound, undefined)
    }

    let accessVerificationResult = directory.permissions.hasAccess(user,  requestedAccess);
    if (accessVerificationResult && accessVerificationResult.isSuccess ) {
      this._currentNode = directory;
      this._currentPath = this._getCurrentPath();

      return new ChangeDirectoryResult(PathOperationResult.Success, accessVerificationResult);
    }

    return new ChangeDirectoryResult(PathOperationResult.Denied, accessVerificationResult);
  }

  private _getCurrentPath(): string {
    let buildPath = (path: Array<string>, node: Directory | undefined): Array<string> => {
      if (!node) return [];
      if (node === this._api.endOfFileSystem) return path;
      return [node.name, ...buildPath(path, node.getParentDirectory())];
    }

    let path = buildPath([], this._currentNode);
    return path.reverse().join('/');
  }
}

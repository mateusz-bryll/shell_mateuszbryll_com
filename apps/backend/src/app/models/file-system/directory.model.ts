import { Moment } from "moment/moment";
import { FsEntry, FsEntryType } from "./fs-entry.model";
import { File } from "./file.model";

export interface DirectoryAttributes {
  readonly gitBranchName: string;
  readonly gitHasUncommitedChanges: boolean;
  readonly showSshMetadata: boolean;
  readonly position: string;
  readonly positionStartDate: string;
}

export class Directory extends FsEntry {
  constructor(name: string, lastModified: Moment, parent: Directory | undefined, attributes: Partial<DirectoryAttributes> | undefined = undefined) {
    super(FsEntryType.Directory, name, lastModified);

    this._parent = parent;
    this._entries = [];
    this._attributes = attributes;
  }

  private readonly _parent: Directory | undefined;
  private readonly _entries: Array<FsEntry>;
  private readonly _attributes: Partial<DirectoryAttributes> | undefined;

  public addFile(file: File): void {
    this._entries.push(file);
  }

  public getChildFile(name: string): File | undefined {
    return this._entries.filter(this.isFile).find(file => file.name === name);
  }

  public addDirectory(directory: Directory): void {
    this._entries.push(directory);
  }

  public getChildDirectory(name: string): Directory | undefined {
    return this._entries.filter(this.isDirectory).find(directory => directory.name === name);
  }

  public getParentDirectory(): Directory | undefined {
    return this._parent;
  }

  public getDirectoryAttributes() : DirectoryAttributes {
    if (this._parent === undefined && this._attributes !== undefined) {
      return this._attributes as DirectoryAttributes;
    }

    if (this._parent !== undefined && this._attributes === undefined) {
      return this._parent.getDirectoryAttributes();
    }

    return { ...this._parent.getDirectoryAttributes(), ...this._attributes } as DirectoryAttributes;
  }

  private isFile(fsEntry: FsEntry): fsEntry is File {
    return fsEntry.entryType === FsEntryType.File;
  }

  private isDirectory(fsEntry: FsEntry): fsEntry is Directory {
    return fsEntry.entryType === FsEntryType.Directory;
  }
}

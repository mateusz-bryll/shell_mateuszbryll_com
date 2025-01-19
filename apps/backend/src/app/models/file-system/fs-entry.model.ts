import { Moment } from "moment";
import { File } from "./file.model";
import { Directory } from "./directory.model";

export enum FsEntryType {
  File = 'file',
  Directory = 'directory',
}

export abstract class FsEntry {
  constructor(type: FsEntryType, name: string, lastModified: Moment) {
    this._entryType = type;
    this._name = name;
    this._lastModified = lastModified;
  }

  private readonly _entryType: FsEntryType;
  private readonly _name: string;
  private readonly _lastModified: Moment;

  public get entryType(): FsEntryType {
    return this._entryType;
  }

  public get name(): string {
    return this._name;
  }

  public get lastModified(): Moment {
    return this._lastModified;
  }
}



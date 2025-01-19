import { Moment } from "moment/moment";
import { FsEntry, FsEntryType } from "./fs-entry.model";

export enum FileType {
  Regular = 'regular',
  Executable = 'executable',
}

export class File extends FsEntry {
  constructor(name: string, lastModified: Moment, type: FileType, content: string) {
    super(FsEntryType.File, name, lastModified);

    this._fileType = type;
    this._content = content;
  }

  private readonly _fileType: FileType;
  private readonly _content: string;

  public get fileType(): FileType {
    return this._fileType;
  }

  public getContent(): string {
    return this._content;
  }
}

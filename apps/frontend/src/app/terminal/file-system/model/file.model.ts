import {OutputStringFormat} from './output-string.format';
import {Moment} from 'moment';
import {FsEntry, FsEntryExtendedAttributes, FsEntryType} from './fs-entry.model';
import {Permissions} from './permissions.model';

export enum FileType {
  Regular = 'regular',
  Executable = 'executable',
}

export class File extends FsEntry {

  constructor(name: string, private readonly _type: FileType, lastModified: Moment, permissions: Permissions, public readonly content: string, attributes: FsEntryExtendedAttributes | undefined = undefined) {
    super(FsEntryType.File, name, lastModified, permissions, attributes);
  }

  get type(): string {
    return this._type;
  }

  getShortOutput(name: string): string {
    return `<span class="${this.type.toString()}">${this.name}</span>`;
  }

  getLongOutput(name: string, fileExtendedAttr: string): string {
    return `-${this.permissions.toString()}${fileExtendedAttr}   1 ${this.permissions.user.toString()}\t${this.lastModified.format('DD MMM YYYY HH:mm')}  <span class="${this.type.toString()}">${this.name}</span>`;
  }
}

import {Moment} from 'moment/moment';
import {Permissions} from './permissions.model';
import {OutputStringFormat} from './output-string.format';

export interface FsEntryExtendedAttributes {
  readonly gitBranchName?: string;
  readonly gitHasUncommitedChanges?: boolean;
  readonly showSshMetadata?: boolean;
  readonly position?: string;
  readonly positionStartDate?: string;
}

export enum FsEntryType {
  File = 'file',
  Directory = 'directory',
}

export abstract class FsEntry {
  protected constructor(private readonly _fsEntryType: FsEntryType, private readonly _name: string, private readonly _lastModified: Moment, private readonly _permissions: Permissions, private readonly _attributes: FsEntryExtendedAttributes | undefined) { }

  get name() {
    return this._name;
  }

  get permissions() {
    return this._permissions;
  }

  get lastModified(): Moment {
    return this._lastModified;
  }

  get attributes() {
    return this._attributes;
  }

  hasExtendedAttributes(): boolean {
    return !!this._attributes;
  }

  isFile(): boolean {
    return this._fsEntryType === FsEntryType.File;
  }

  idDirectory(): boolean {
    return this._fsEntryType === FsEntryType.Directory;
  }

  isHidden(): boolean {
    return this._name.indexOf('.') === 0;
  }

  toOutputString(format: OutputStringFormat, showAsName: string | undefined = undefined): string {
    if (format === OutputStringFormat.Short) {
      return this.getShortOutput(showAsName ?? this.name);
    } else {
      let fileExtendedAttr = this.hasExtendedAttributes()? '@' : '.';
      return this.getLongOutput(showAsName ?? this.name, fileExtendedAttr);
    }
  }

  protected abstract getShortOutput(name: string): string;
  protected abstract getLongOutput(name: string, fileExtendedAttr: string): string;
}

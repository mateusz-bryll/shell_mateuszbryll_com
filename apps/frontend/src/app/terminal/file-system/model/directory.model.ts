import {OutputStringFormat} from './output-string.format';
import {File} from './file.model';
import {Moment} from 'moment';
import {FsEntry, FsEntryExtendedAttributes, FsEntryType} from './fs-entry.model';
import {Permissions} from './permissions.model';

export class Directory extends FsEntry {
  private _content: Array<FsEntry> = [];

  constructor(name: string, lastModified: Moment, private readonly _parent: Directory | undefined, permissions: Permissions, attributes: FsEntryExtendedAttributes | undefined = undefined) {
    super(FsEntryType.Directory, name, lastModified, permissions, attributes);
  }

  addFile(file: File): void {
    this._content.push(file);
  }

  addDirectory(directory: Directory): void {
    this._content.push(directory);
  }

  override get attributes() : FsEntryExtendedAttributes {
    if (this._parent === undefined || super.attributes !== undefined) {
      return super.attributes ?? { } as FsEntryExtendedAttributes;
    }

    return { ...this._parent.attributes, ...super.attributes! } as FsEntryExtendedAttributes;
  }

  getShortOutput(name: string): string {
    return `<span class="directory">${name ?? this.name}</span>`;
  }

  getLongOutput(name: string, fileExtendedAttr: string): string {
    return `d${this.permissions.toString()}${fileExtendedAttr}  ${(this._content.length + 2).toString().padStart(2, ' ')} ${this.permissions.user.toString()}\t${this.lastModified.format('DD MMM YYYY HH:mm')}  <span class="directory">${name ?? this.name}</span>`;
  }

  getParentDirectory(): Directory | undefined {
    return this._parent;
  }

  getChildDirectory(name: string): Directory | undefined {
    return this._content.find(x => x.idDirectory() && x.name === name) as Directory;
  }

  getChildFile(name: string): File | undefined {
    return this._content.find(x => x.isFile() && x.name === name) as File;
  }

  toContentOutputString(format: OutputStringFormat, showHidden: boolean): string {
    let separator = format === OutputStringFormat.Short ? ' ' : '\n';
    let navigation = showHidden ? [this.toOutputString(format, '.'), this._parent?.toOutputString(format, '..')] : [];

    return navigation.join(separator) + separator + this._content
      .sort((a, b) => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
      })
      .filter(x => showHidden ? true : !x.isHidden())
      .map(x => x.toOutputString(format))
      .join(separator);
  }
}

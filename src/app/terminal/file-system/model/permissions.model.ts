import {User} from './user.model';

export enum RequestedAccess {
  Read = 'r',
  Write = 'w',
  Execute = 'x',
}

export class VerificationResult {
  constructor(private readonly _requestedAccess: RequestedAccess, private readonly _actualPermissions: string) { }

  get isSuccess() {
    return this._actualPermissions.indexOf(this._requestedAccess.toString()) !== -1;
  }

  toString(): string {
    return `requested access: ${this._requestedAccess.toString()}, your permissions: ${this._actualPermissions}`;
  }
}

export class Permissions {
  constructor(private readonly _owner: User, private readonly _ownerPermissions: string, private readonly _groupPermissions: string, private readonly _othersPermissions: string) { }

  get user() {
    return this._owner;
  }

  get ownerPermissions() {
    return this._ownerPermissions;
  }

  get groupPermissions() {
    return this._groupPermissions;
  }

  get othersPermissions() {
    return this._othersPermissions;
  }

  hasAccess(user: User, requestedAccess: RequestedAccess): VerificationResult {
    if (this._owner.equals(user)) {
      return new VerificationResult(requestedAccess, this._ownerPermissions);
    }

    if (this._owner.inSameGroup(user)) {
      return new VerificationResult(requestedAccess, this._groupPermissions);
    }

    return new VerificationResult(requestedAccess, this._othersPermissions);
  }

  toString(): string {
    return `${this._ownerPermissions}${this._groupPermissions}${this._othersPermissions}`;
  }
}

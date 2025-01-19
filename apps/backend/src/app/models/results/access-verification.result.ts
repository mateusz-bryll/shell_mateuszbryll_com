import {RequestedAccessEnum} from "../permissions/requested.access.enum";

export class AccessVerificationResult {
  constructor(private readonly _requestedAccess: RequestedAccessEnum, private readonly _actualPermissions: string) { }

  get isSuccess() {
    return this._actualPermissions.indexOf(this._requestedAccess.toString()) !== -1;
  }

  toString(): string {
    return `requested access: ${this._requestedAccess.toString()}, your permissions: ${this._actualPermissions}`;
  }
}

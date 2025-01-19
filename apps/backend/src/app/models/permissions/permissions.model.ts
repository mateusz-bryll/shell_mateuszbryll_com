import { User } from "./user.model";

export class Permissions {
  constructor(private readonly _owner: User, private readonly _ownerPermissions: string, private readonly _groupPermissions: string, private readonly _othersPermissions: string) { }

  public get user() {
    return this._owner;
  }

  public get ownerPermissions() {
    return this._ownerPermissions;
  }

  public get groupPermissions() {
    return this._groupPermissions;
  }

  public get othersPermissions() {
    return this._othersPermissions;
  }
}

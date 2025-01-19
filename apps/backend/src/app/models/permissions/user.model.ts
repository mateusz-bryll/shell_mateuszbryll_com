export class User {
  constructor(private readonly _userName: string,  private readonly _groupName: string) { }

  public get userName(): string {
    return this._userName;
  }

  public get groupName(): string {
    return this._groupName;
  }

  public isSameUser(other: User): boolean {
    return other.userName === this.userName && other.groupName === this.userName;
  }

  public inSameGroup(other: User): boolean {
    return other.groupName === this.groupName;
  }
}

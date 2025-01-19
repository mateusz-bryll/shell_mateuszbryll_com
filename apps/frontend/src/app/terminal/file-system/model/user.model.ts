export class User {
  constructor(private readonly _userName: string,  private readonly _groupName: string) { }

  get userName() {
    return this._userName;
  }

  get groupName() {
    return this._groupName;
  }

  equals(other: User): boolean {
    return other.userName === this.userName && other.groupName === this.userName;
  }

  inSameGroup(other: User): boolean {
    return other.groupName === this.groupName;
  }

  toString(): string {
    return `${this._userName}\t${this._groupName}`;
  }
}

import {PathOperationResult} from "./path-operation.result";
import {VerificationResult} from "../model/permissions.model";

export class ChangeDirectoryResult {
  constructor(private readonly _pathOperationResult: PathOperationResult, private readonly _accessVerificationResult: VerificationResult | undefined) { }

  get pathOperationResult() {
    return this._pathOperationResult;
  }

  get accessVerificationResult() {
    return this._accessVerificationResult;
  }
}

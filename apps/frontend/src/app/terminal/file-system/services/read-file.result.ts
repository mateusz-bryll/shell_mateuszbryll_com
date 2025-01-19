import {FileOperationResult} from "./file-operation.result";
import {VerificationResult} from "../model/permissions.model";

export class ReadFileResult {
  constructor(private readonly _fileOperationResult: FileOperationResult,
              private readonly _content: string | undefined,
              private readonly _accessVerificationResult: VerificationResult | undefined
  ) { }

  get content() {
    return this._content;
  }

  get fileOperationResult() {
    return this._fileOperationResult;
  }

  get accessVerificationResult() {
    return this._accessVerificationResult;
  }
}

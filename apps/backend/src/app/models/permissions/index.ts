import {AccessVerificationResult} from "../results";
import { Permissions } from './permissions.model';
import { RequestedAccessEnum } from './requested.access.enum';
import { User } from './user.model';

export { Permissions } from './permissions.model';
export { RequestedAccessEnum } from './requested.access.enum';
export { User } from './user.model';

export function hasAccess(user: User, requestedAccess: RequestedAccessEnum, permissions: Permissions): AccessVerificationResult {
  if (permissions.user.isSameUser(user)) {
    return new AccessVerificationResult(requestedAccess, permissions.ownerPermissions);
  }

  if (permissions.user.inSameGroup(user)) {
    return new AccessVerificationResult(requestedAccess, permissions.groupPermissions);
  }

  return new AccessVerificationResult(requestedAccess, permissions.othersPermissions);
}

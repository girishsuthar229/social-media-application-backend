export enum ApiMethodType {
  POST = 'POST',
}

export enum AccessTypes {
  PUBLIC = 'public',
  SKIP_PERMISSION_CHECK = 'skip_permission_check',
}

export enum UploadFolders {
  USER_IMAGES = 'user-images',
  POST_IMAGES = 'post-images',
}
export enum MimeType {
  PNG = 'image/png',
  JPG = 'image/jpg',
  JPEG = 'image/jpeg',
  SVG = 'image/svg+xml',
}

export enum SystemConfigKeys {
  AUTO_LOGOUT_SESSION_TIME = 60,
  OTP_EXPIRY_TIME = 2,
  PSW_EXPIRY_TIME = 2,
}

export enum ErrorType {
  NotFound = 'NotFound',
  BadRequest = 'BadRequest',
  Unauthorized = 'Unauthorized',
  Conflict = 'Conflict',
  InternalServerError = 'InternalServerError',
  InvalidCredentials = 'InvalidCredentials',
  InvalidPassword = 'InvalidPassword',
  UserNotFound = 'UserNotFound',
  DuplicatePasswordError = 'DuplicatePasswordError',
  PasswordMismatch = 'PasswordMismatch',
  InvalidNewPassword = 'InvalidNewPassword',
  InvalidToken = 'InvalidToken',
  AlphabetsOnlyAllowed = 'AlphabetsOnlyAllowed',
  InvalidMobileNumber = 'InvalidMobileNumber',
  ResetPasswordTokenExpired = 'ResetPasswordTokenExpired',
  TokenAlreadyUsed = 'TokenAlreadyUsed',
  TokenExpiredError = 'TokenExpiredError',
  RoleNotExist = 'UserRoleNotExist',
  SafeIntError = 'SafeIntError',
  AlphaSpaceAllowed = 'AlphaSpaceAllowed',
  AlphaNumericSpecialCharacterAllowed = 'AlphaNumericSpecialCharacterAllowed',
  AlphaNumericAllowed = 'AlphaNumericAllowed',
  RoleNameMustBeUnique = 'RoleNameMustBeUnique',
  InvalidEmail = 'InvalidEmail',
  EmailMustBeUnique = 'EmailMustBeUnique',
  UserNameMustBeUnique = 'UserNameMustBeUnique',
  PasswordAlreadyChanged = 'PasswordAlreadyChanged',
  PasswordLinkExpired = 'PasswordLinkExpired',
  PasswordLinkInvalid = 'PasswordLinkInvalid',
  OTPRequired = 'OTPRequired',
  OTPInvalid = 'OTPInvalid',
  DateCannotBeInFuture = 'DateCannotBeInFuture',
  ToDateMustBeFiveYearsOld = 'ToDateMustBeFiveYearsOld',
  FileRequired = 'FileRequired',
  InvalidFileType = 'InvalidFileType',
  FileSizeExceeded = 'FileSizeExceeded',
  PostNotToBeCreate = 'PostNotToBeCreate',
}

export enum RolesOperation {
  FETCHED = 'ROLE_FETCHED',
  CREATE = 'ROLE_CREATE',
  UPDATE_STATUS = 'ROLE_UPDATE_STATUS',
  UPDATE = 'ROLE_UPDATE',
  ASSIGN_ROLE_PERMISSION = 'ASSIGN_ROLE_PERMISSION',
  FETCH_ROLE_PERMISSIONS = 'FETCH_ROLE_PERMISSIONS',
  DELETE = 'ROLE_DELETE',
}

export enum UsersOperation {
  LOGIN = 'USER_LOGIN',
  OTP_SENT = 'OTP_SENT',
  FETCHED = 'USER_FETCHED',
  UPDATE = 'USER_UPDATE',
  RESET_PASSWORD = 'RESET_PASSWORD',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  FETCHED_USERS_LIST = 'FETCHED_USERS_LIST',
  RESEND_PASSWORD = 'RESEND_PASSWORD',
  USER_CREATED = 'USER_CREATED',
  USER_STATUS_UPDATE = 'USER_STATUS_UPDATE',
  DELETE = 'DELETE',
}
export enum UsersOperation {
  USER_CREATEDs = 'User created successfully',
  USER_UPDATED = 'User updated successfully',
  USER_DELETED = 'User deleted successfully',
  USER_FETCHED = 'User fetched successfully',
  USERS_FETCHED = 'Users fetched successfully',
  USERS_SEARCHED = 'Users searched successfully',
  SUGGESTED_USERS_FETCHED = 'Suggested users fetched successfully',
  FOLLOWERS_FETCHED = 'Followers fetched successfully',
  FOLLOWING_FETCHED = 'Following fetched successfully',
}

export enum LookupDetailsCode {
  ENABLED = 'ENABLED',
  DISABLED = 'DISABLED',
  DRAFT = 'DRAFT',
}

export enum LookupCode {
  USER_STATUS = 'USER_STATUS',
}

export enum PostsOperation {
  POSTS_FETCHED = 'POSTS_FETCHED',
  POST_FETCHED = 'POST_FETCHED',
  USER_POSTS_FETCHED = 'USER_POSTS_FETCHED',
  POST_CREATED = 'POST_CREATED',
  POST_UPDATED = 'POST_UPDATED',
  POST_LIKED = 'POST_LIKED',
  POST_UNLIKED = 'POST_UNLIKED',
  POST_DELETED = 'POST_DELETED',
  POST_SHARED = 'POST_SHARED',
  POST_STATUS_UPDATE = 'POST_STATUS_UPDATE',
  DELETE = 'DELETE',
}

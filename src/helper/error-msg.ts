import { ErrorType } from './enum';

export const Messages = {
  InternalServerError:
    'There was some technical error processing this request. Please try again.',
  RoleMessages: {
    Fetched: 'Roles fetched successfully',
    Created: 'Role added successfully',
    UpdatedStatus: 'Role status changed successfully',
    Updated: 'Role updated successfully',
    AssignRolePermission: 'Role permission assigned successfully',
    FetchRolePermissions: 'Role permissions fetched successfully',
    Deleted: 'Role deleted successfully',
  },
  UserMessages: {
    Login: 'Login successful',
    Otp_Sent: 'Verification OTP sent successfully',
    UpdatePassword: 'Password updated successfully',
    ResetPassword: 'Password reset successfully',
    Fetched: 'User details fetched successfully',
    User_Update: 'User details updated successfully',
    Fetched_Users_List: 'Users list fetched successfully',
    ResendPassword: 'Password setup link has been resent successfully.',
    UserCreated: 'User added successfully.',
    UserStatusUpdated: 'User Status updated successfully.',
    Deleted: 'User Deleted Successfully.',
  },
};
export const ErrorMessages: Record<ErrorType, string> = {
  [ErrorType.NotFound]:
    'Requested resource not found or you do not have permission to access.',
  [ErrorType.BadRequest]: 'Invalid input provided.',
  [ErrorType.Conflict]: 'A conflict occurred with existing data.',
  [ErrorType.Unauthorized]: 'You are not authorized to perform this action.',
  [ErrorType.InvalidCredentials]: 'Invalid username or password',
  [ErrorType.InternalServerError]:
    'There was some technical error processing this request. Please try again.',
  [ErrorType.InvalidPassword]: 'Password must be at least 8 characters long.',
  [ErrorType.UserNotFound]: 'User not found',
  [ErrorType.DuplicatePasswordError]:
    'The new password cannot be the same as the current password.',
  [ErrorType.PasswordMismatch]:
    'Password and confirmation password do not match.',
  [ErrorType.InvalidNewPassword]:
    'Your new password must be different from the old one.',
  [ErrorType.InvalidToken]: 'Invalid or expired token',
  [ErrorType.AlphabetsOnlyAllowed]: 'Only alphabets are allowed',
  [ErrorType.InvalidMobileNumber]: 'Only digits are allowed',
  [ErrorType.ResetPasswordTokenExpired]:
    'The password reset period has expired.',
  [ErrorType.TokenAlreadyUsed]: 'This reset token has already been used.',
  [ErrorType.TokenExpiredError]: 'Token has been expired',
  [ErrorType.RoleNotExist]: 'Role not exists.',
  [ErrorType.SafeIntError]:
    '[#PROPERTY_NAME#] must be an integer between 0 and [#SAFE_INTEGER_RANGE#].',
  [ErrorType.AlphaSpaceAllowed]: 'Only letters and space are allowed.',
  [ErrorType.AlphaNumericAllowed]: 'Only letters and numbers are allowed.',
  [ErrorType.AlphaNumericSpecialCharacterAllowed]:
    "Only letters, numbers, and specific special characters (- _ ' , . # / \\) are allowed",
  [ErrorType.RoleNameMustBeUnique]: 'Role name must be unique',
  [ErrorType.InvalidEmail]: 'Please enter a valid email address.',
  [ErrorType.EmailMustBeUnique]: 'Email already exists.',
  [ErrorType.UserNameMustBeUnique]: 'UserName already exists.',
  [ErrorType.PasswordLinkExpired]: 'Password link has expired.',
  [ErrorType.PasswordAlreadyChanged]: 'Your password has already been changed.',
  [ErrorType.PasswordLinkInvalid]:
    'The password link is incorrect. Please make sure you are using the latest link sent to your email.',
  [ErrorType.DateCannotBeInFuture]: 'birth_date cannot be a future date',
  [ErrorType.ToDateMustBeFiveYearsOld]: 'User must be at least 5 years old.',
  [ErrorType.OTPRequired]: 'OTP are empty',
  [ErrorType.OTPInvalid]: 'Invalid enter OTP',
  [ErrorType.FileRequired]: 'Please upload the required file.',
  [ErrorType.InvalidFileType]:
    'Invalid file type. Allowed types: [#ALLOWED_FILE_TYPES#].',
  [ErrorType.FileSizeExceeded]:
    'File size exceeds the maximum limit of [MAX_SIZE].',
  [ErrorType.PostNotToBeCreate]:
    'The user ID is invalid. Please check your credentials and try again.',
};

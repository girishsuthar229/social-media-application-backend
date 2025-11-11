import { PostsOperation, RolesOperation, UsersOperation } from './enum';
import { Messages } from './error-msg';

export function sanitizeString(value: string): string {
  return value.replace(/\s/g, '').toLowerCase();
}

export function getDateAndTime(): Date {
  return new Date();
}

export function getMessageByCode(messageKey: string): string {
  switch (messageKey) {
    case RolesOperation.FETCHED:
      return Messages.RoleMessages.Fetched;
    case RolesOperation.CREATE:
      return Messages.RoleMessages.Created;
    case RolesOperation.UPDATE_STATUS:
      return Messages.RoleMessages.UpdatedStatus;
    case RolesOperation.UPDATE:
      return Messages.RoleMessages.Updated;
    case RolesOperation.ASSIGN_ROLE_PERMISSION:
      return Messages.RoleMessages.AssignRolePermission;
    case RolesOperation.FETCH_ROLE_PERMISSIONS:
      return Messages.RoleMessages.FetchRolePermissions;
    case RolesOperation.DELETE:
      return Messages.RoleMessages.Deleted;

    case UsersOperation.LOGIN:
      return Messages.UserMessages.Login;
    case UsersOperation.OTP_SENT:
      return Messages.UserMessages.Otp_Sent;
    case UsersOperation.RESET_PASSWORD:
      return Messages.UserMessages.ResetPassword;
    case UsersOperation.UPDATE_PASSWORD:
      return Messages.UserMessages.UpdatePassword;
    case UsersOperation.UPDATE:
      return Messages.UserMessages.User_Update;
    case UsersOperation.RESEND_PASSWORD:
      return Messages.UserMessages.ResendPassword;
    case UsersOperation.FETCHED:
      return Messages.UserMessages.Fetched;
    case UsersOperation.FETCHED_USERS_LIST:
      return Messages.UserMessages.Fetched_Users_List;
    case UsersOperation.USER_CREATED:
      return Messages.UserMessages.UserCreated;
    case UsersOperation.USER_STATUS_UPDATE:
      return Messages.UserMessages.UserStatusUpdated;
    case UsersOperation.DELETE:
      return Messages.UserMessages.Deleted;

    case PostsOperation.POSTS_FETCHED:
      return Messages.PostMessages.Fetched_Post_List;
    case PostsOperation.POST_FETCHED:
      return Messages.PostMessages.PostFetched;
    case PostsOperation.USER_POSTS_FETCHED:
      return Messages.PostMessages.PostsFetched;
    case PostsOperation.POST_CREATED:
      return Messages.PostMessages.PostCreated;
    case PostsOperation.POST_LIKED:
      return Messages.PostMessages.PostLike;
    case PostsOperation.POST_UNLIKED:
      return Messages.PostMessages.PostUnLike;
    case PostsOperation.POST_LIKED_ALL_USERS_FETCHED:
      return Messages.PostMessages.PostLikedFetchedAllUsers;

    default:
      return Messages.InternalServerError;
  }
}

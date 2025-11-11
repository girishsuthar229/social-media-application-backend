import { SetMetadata } from '@nestjs/common';
import { AccessTypes } from 'src/helper';

export const IS_PUBLIC_KEY = 'isPublic';

export const Public = (accessType: AccessTypes = AccessTypes.PUBLIC) => {
  return SetMetadata(IS_PUBLIC_KEY, accessType);
};

import { SetMetadata } from '@nestjs/common';

export interface FileValidationOptions {
  allowedMimeTypes: string[];
  maxSize?: number;
  isRemovable?: boolean;
  isOptional?: boolean;
}
export const FILE_VALIDATION_KEY = 'fileValidation';

export const FileValidation = (options: FileValidationOptions) =>
  SetMetadata(FILE_VALIDATION_KEY, {
    ...options,
    isRemovable: options.isRemovable ?? false,
    isOptional: options.isOptional ?? false
  });

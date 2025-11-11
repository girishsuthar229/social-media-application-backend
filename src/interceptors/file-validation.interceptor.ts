import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ErrorMessages, ErrorType, SystemConfigKeys } from 'src/helper';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { FILE_VALIDATION_KEY } from 'src/decorators';

@Injectable()
export class FileValidationInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request: Request = context.switchToHttp().getRequest();
    const file = request.file;
    const options = this.reflector.get<{
      allowedMimeTypes: string[];
      maxSize: number;
      isRemovable: boolean;
      isOptional: boolean;
    }>(FILE_VALIDATION_KEY, context.getHandler());
    const isLogoChanged = file && options.isOptional ? true : false; // eslint-disable-line @typescript-eslint/no-unsafe-member-access
    if (!isLogoChanged) {
      return next.handle();
    }
    if (!file && options.isRemovable) {
      return next.handle();
    }

    if (!file) {
      throw new BadRequestException({
        error: ErrorType.FileRequired,
        message: ErrorMessages[ErrorType.FileRequired],
      });
    }

    if (!options.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException({
        error: ErrorType.InvalidFileType,
        message: ErrorMessages[ErrorType.InvalidFileType].replace(
          '[#ALLOWED_FILE_TYPES#]',
          options.allowedMimeTypes.join(', '),
        ),
      });
    }

    const imageLimitMb = Number(5);
    const maxSizeBytes = imageLimitMb * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new BadRequestException({
        error: ErrorType.FileSizeExceeded,
        message: ErrorMessages[ErrorType.FileSizeExceeded].replace(
          '[MAX_SIZE]',
          `${imageLimitMb}MB`,
        ),
      });
    }
    return next.handle();
  }
}

import { Injectable } from '@nestjs/common';

@Injectable()
export class ResponseHelper {
  success(code: number, message: string, data?: any) {
    return {
      success: true,
      code,
      message,
      data: data ?? null,
    };
  }

  fail(code: number, message: string, errors?: any) {
    return {
      success: false,
      code,
      message,
      errors: errors ?? null,
    };
  }
}

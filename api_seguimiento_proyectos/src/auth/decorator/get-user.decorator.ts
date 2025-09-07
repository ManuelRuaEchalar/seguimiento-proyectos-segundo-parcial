import {
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { Request } from 'express';  // Import Express Request for better typing


export const GetUser = createParamDecorator(
  (
    data: string | undefined,
    ctx: ExecutionContext,
  ) => {
    const request: Request = ctx
      .switchToHttp()
      .getRequest();
    if (data) {
      return request.user![data];
    }
    return request.user!;
  },
);

import { Global, Module } from '@nestjs/common';
import { ResponseHelper } from './helper/response';

@Global()
@Module({
  providers: [ResponseHelper],
  exports: [ResponseHelper],
})
export class Library {}
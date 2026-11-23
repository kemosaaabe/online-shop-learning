import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import { UsersService } from './users.service.js';

@Module({
  providers: [UsersService],
  exports: [UsersService],
  imports: [DatabaseModule],
})
export class UsersModule {}

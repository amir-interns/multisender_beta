import { Module } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import { AuthEntity } from 'src/entities/auth.entity';

@Module({
  imports:[ TypeOrmModule.forFeature([AuthEntity])],
  providers: [UsersService],
  exports:[UsersService]
})
export class UsersModule {}

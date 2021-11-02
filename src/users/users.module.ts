import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Auth} from "../../bd/src/entity/Auth";

@Module({
  imports:[ TypeOrmModule.forFeature([Auth])],
  providers: [UsersService],
  exports:[UsersService]
})
export class UsersModule {}

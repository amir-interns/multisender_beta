import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import {UsersService} from "../users/users.service";
import {LocalStrategy} from "./local.strategy";
import {PassportModule} from "@nestjs/passport";

@Module({
  imports:[UsersService, PassportModule],
  providers: [AuthService, LocalStrategy]
})
export class AuthModule {}

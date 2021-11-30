import { Module } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import {PassportModule} from "@nestjs/passport";
import {UsersModule} from "src/users/users.module";
import { JwtModule } from "@nestjs/jwt";
import { jwtConstants } from "config/constant";
import {JwtStrategy} from "src/auth/jwt.strategy";

@Module({
  imports:[UsersModule, PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '10d'},
    }),
  ],
  providers: [AuthService,  JwtStrategy],
  exports:[AuthService]
})
export class AuthModule {}

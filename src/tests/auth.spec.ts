import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import {AppController} from '../app.controller';
import {AuthService} from "../auth/auth.service";
import {UsersService} from "../users/users.service";
import {JwtModule, JwtService} from "@nestjs/jwt";
import {AuthEntity} from "../entity/auth.entity";
import {Repository} from "typeorm";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UsersModule} from "../users/users.module";
import {AuthModule} from "../auth/auth.module";
import {JWT_MODULE_OPTIONS} from "@nestjs/jwt/dist/jwt.constants";
import {PassportModule} from "@nestjs/passport";
import {JwtStrategy} from "../auth/jwt.strategy";
import {jwtConstants} from "../../config/constant";


describe('Auth Contr', () => {
  let catsController: AppController;

  beforeEach(async () => {
    const moduleRef : TestingModule = await Test.createTestingModule({
      imports:[ TypeOrmModule.forFeature([AuthEntity]), JwtModule, UsersModule, AuthModule, PassportModule, ],
      controllers: [AppController],
      providers: [AuthService, UsersService, JwtService, JwtStrategy]
    }).compile();

    catsController = moduleRef.get<AppController>(AppController);
  });

  describe('login', () => {
    it('should return an array of cats', async () => {
      const result = ['Wrong password or username'];
      // jest.spyOn(AuthService, 'login',).mockImplementation(() => result);
      expect(await catsController.login({"username":"user", "password":"use"})).toBe(result);
    });
  });
});
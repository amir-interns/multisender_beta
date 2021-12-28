import {Test, TestingModule} from '@nestjs/testing';
import {AppController} from 'src/app.controller';
import {AuthService} from "src/auth/auth.service";
import {UsersService} from "src/users/users.service";
import {JwtModule} from "@nestjs/jwt";
import {AuthEntity} from "src/entities/auth.entity";
import {TypeOrmModule} from "@nestjs/typeorm";
import {PassportModule} from "@nestjs/passport";
import {JwtStrategy} from "src/auth/jwt.strategy";
import {UsersModule} from "src/users/users.module";
import {AppModule} from "src/app.module";
import {AppService} from "src/app.service";



describe('Auth Contr', () => {
  let appController: AppController;

  beforeAll(async () => {
    const moduleRef : TestingModule = await Test.createTestingModule({
      imports:[AppModule,TypeOrmModule.forFeature([AuthEntity]),  PassportModule, UsersModule,
        JwtModule.register({
          secret: 'secretKey',
          signOptions: { expiresIn: '5d' },
        })],
      controllers:[AppController],
      providers:[ AuthService,  AppService, UsersService, JwtStrategy],
    }).compile();

    appController = moduleRef.get<AppController>(AppController);
  });

  describe('Registration password length', () => {
    it('should return error!', async () => {
      const result = 'easy password!';
      expect(await appController.regist({"username":"user1", "password":"us"})).toBe(result);
    });
  });
  describe('Authentication token', () => {
    it('should return token', async () => {
      expect(await appController.login({"username":"user", "password":"user"})).
      toMatchObject({access_token:expect.stringMatching("(.){152}")})
    });
  });
});
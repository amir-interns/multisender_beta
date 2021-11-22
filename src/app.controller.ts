import {Body, Controller, Get, Post, UseGuards} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';
import {AuthService} from "./auth/auth.service";

@ApiTags('Основные методы')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
              private authService:AuthService
  ) {}

  @ApiOperation({summary: 'Процедура аутентификации'})
  @ApiResponse({status: 200, description: 'Аутентификация' })
  @Post('auth')
  async login(@Body() req) {
    return this.authService.login(req)
  }

  @ApiOperation({summary: 'Процедура регистрации'})
  @ApiResponse({status: 200, description: 'Регистрация' })
  @Post('regist')
  async regist(@Body() req){
    return this.authService.register(req)
  }

  getHello(){
    return this.appService.getHello()
  }

}

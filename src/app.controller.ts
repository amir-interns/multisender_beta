import {Body, Controller, Get, Post, UseGuards} from '@nestjs/common';
import { AppService } from './app.service';
import {AuthGuard} from "@nestjs/passport";
import {AuthService} from "./auth/auth.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
              private authService:AuthService) {}


  // @UseGuards(AuthGuard('local'))
  @Post('auth')
  async login(@Body() req) {
    return this.authService.login(req)
  }

  @Post('regist')
  async regist(@Body() req){
    return this.authService.register(req)
  }

}

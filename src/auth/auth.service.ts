import { Injectable } from '@nestjs/common';
import { UsersService} from '../users/users.service';
import {JwtService} from "@nestjs/jwt";
import  * as bcrypt  from 'bcrypt'
import {getConnection} from "typeorm";
import {Auth} from "../../bd/src/entity/Auth";

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService,
              private jwtService:JwtService) {}


  async login(user: any) {
    let result = await getConnection()
      .getRepository(Auth)
      .createQueryBuilder('auth')
      .where('username=:user', {user:user.username})
      .getOne()
    const passwMatch=await bcrypt.compare(user.password, result.password)
    if (passwMatch){
      const payload = { username: user.username, sub: user.userId };
      return {
        access_token: this.jwtService.sign(payload),
      }
    }
    else {
      return 'Wrong password or username'
    }
  }

  async register(user){
    const hashedPassword=await bcrypt.hash(user.password, 10)
    let result = await getConnection()
      .getRepository(Auth)
      .createQueryBuilder('auth')
      .where('username=:user', {user:user.username})
      .getOne()
    if (result){
      return 'Change username!'
    }
    try{
      const createdUser=await this.usersService.create(user.username, hashedPassword)
      return createdUser
    }
    catch(error){
      return error
    }
  }
}
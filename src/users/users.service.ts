import { Injectable } from '@nestjs/common';
import {getRepository, Repository} from "typeorm";
import { Auth } from 'src/entity/Auth';
import {InjectRepository} from "@nestjs/typeorm";



export type User = any;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Auth)
    private auth:Repository<Auth>
  ){}


  async findOne(username: string): Promise<User | undefined> {
    let user=await this.auth.findOne({where:{username}, select:["username", "password"]})
    return user
  }

  async create(username:string, password:string):Promise <any>{
    let auth=new Auth()
    auth.username=username
    auth.password=password
    return this.auth.save(auth)
  }

}
import {Controller,  Body, Post, UseGuards, } from '@nestjs/common'
import {JwtAuthGuard} from "src/auth/jwt-auth.guard";
import {RequestTask} from "src/request/request.task";
import {InjectRepository} from "@nestjs/typeorm";
import {BlockchainEntity} from "src/entities/blockchain.entity";
import {Repository} from "typeorm";


@Controller('request')
export class RequestController {
  constructor(
    private task:RequestTask,
    @InjectRepository(BlockchainEntity)
    private blockchainRepository:Repository<BlockchainEntity>
  ) {}
  @UseGuards(JwtAuthGuard)
  @Post('createRequest')
  async sendBlockchainTx(@Body() params: any):Promise<any>{
    return this.task.createRequest(params.send, params.type)
  }
  @UseGuards(JwtAuthGuard)
  @Post('deleteRequest')
  async deleteRequest(@Body() id: number):Promise<any>{
    return this.task.deleteRequest(id)
  }
  @Post('findAll')
  async findAll() {
    return this.task.findAll()
  }
}


import {Controller, Param, Body, Inject, Post, UseGuards, } from '@nestjs/common'
import {JwtAuthGuard} from "src/auth/jwt-auth.guard";
import {QueueTask} from "../queue/queue.task";
import {InjectRepository} from "@nestjs/typeorm";
import {BlockchainEntity} from "../entity/blockchain.entity";
import {Repository} from "typeorm";


interface IRequestTask{
  createRequest(send:object, type:string):any;
}


@Controller('blockchain')
export class RequestController {
  constructor(
    private task:QueueTask,
    @InjectRepository(BlockchainEntity)
    private blockchainRepository:Repository<BlockchainEntity>
  ) {}
  @UseGuards(JwtAuthGuard)
  @Post('sendTx')
  async sendBlockchainTx(@Body() params: any):Promise<any>{
    return this.task.createRequest(params.send, params.type)
  }
}


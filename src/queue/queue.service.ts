import { Injectable } from '@nestjs/common'
import {BlockchainEntity} from "src/entity/blockchain.entity"
import {getConnection, Repository} from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import {RequestEntity} from "src/entity/request.entity";
import {getRepository} from "typeorm";
import { EthereumService } from 'src/blockchain/ethereum.service';

@Injectable()
export class QueueService {

  constructor(
    @InjectRepository(RequestEntity)
    private applicationRepository:Repository<RequestEntity>,
    private service:EthereumService
  ) { }

  async getBalance(address){
    return this.service.getBalance(address)
  }

  async findAll(){
    const queue = await getRepository(RequestEntity)
      .createQueryBuilder()
      .where({status:'new'})
      .getMany();
    return queue
  }

  async updateQueue(idd, stat){
    await getConnection()
      .createQueryBuilder()
      .update(RequestEntity)
      .set({status: stat, date: new Date()})
      .where({id: idd})
      .execute();
  }
}






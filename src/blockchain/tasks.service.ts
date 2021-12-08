import { Injectable} from "@nestjs/common";
import { CronJob } from "cron";
import {Cron, SchedulerRegistry} from "@nestjs/schedule";
import {InjectRepository} from "@nestjs/typeorm";
import {BlockchainEntity} from "../entity/blockchain.entity";
import {Connection, getRepository, Repository} from "typeorm";
import {RequestEntity} from "../entity/request.entity";


@Injectable()
export class BlockchainTask {
  private schedulerRegistry
  private service
  private blockchainRepository
  constructor(private serv:object,
              @InjectRepository(BlockchainEntity)
              private rep:object
  )
  { this.service = serv
    this.blockchainRepository = rep
    this.schedulerRegistry = new SchedulerRegistry()
  }
  async sendTx(send:object, type:string) {
    console.log(this.blockchainRepository, typeof(this.blockchainRepository))
    const bdRecord = await this.blockchainRepository.save({
      result: send, typeCoin: type,
      status: 'new', date: new Date()
    })
    return `Request № ${bdRecord.id} crete`
  }
  @Cron('* * * * * *')
  async confirmateJob() {
    try {
      const bdRecord = await getRepository(BlockchainEntity)
        .createQueryBuilder()
        .where({status: 'submitted'})
        .getOne();
      if (this.service.checkTx(bdRecord.txHash)) {
        await getRepository(BlockchainEntity)
          .createQueryBuilder()
          .where({status: 'confirmed'})
          .getOne();
      }
    }
    catch{
      return 0
    }
  }
}

import { Injectable} from "@nestjs/common";
import { CronJob } from "cron";
import {Cron, SchedulerRegistry} from "@nestjs/schedule";
import {InjectRepository} from "@nestjs/typeorm";
import {BlockchainEntity} from "../entity/blockchain.entity";
import {Connection, getConnection, getRepository, Repository} from "typeorm";
import {RequestEntity} from "../entity/request.entity";


@Injectable()
export class BlockchainTask {
  private schedulerRegistry
  private service
  constructor(private serv:object,
              private blockchainRepository:Repository<BlockchainEntity>)
  { this.service = serv
    this.schedulerRegistry = new SchedulerRegistry()
  }
  async sendTx(send:object, type:string) {
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
        .getMany();
      for (let i=0; i <= bdRecord.length; i++) {
        if (await this.service.checkTx(bdRecord[i].txHash)) {
          await getConnection()
            .createQueryBuilder()
            .update(BlockchainEntity)
            .set({status: 'confirmed'})
            .where({id: bdRecord[i].id})
            .execute();
        }
      }
    }
    catch{
      return 0
    }
  }
}

import { Injectable} from "@nestjs/common";
import { CronJob } from "cron";
import { SchedulerRegistry } from "@nestjs/schedule";
import {BdService} from "src/queue/bd.service";
import { EthereumService } from 'src/blockchain/ethereum.service';
import { Cron } from '@nestjs/schedule';
import {getConnection, getRepository, Repository} from "typeorm";
import {RequestEntity} from "../entity/request.entity";
import {BlockchainEntity} from "../entity/blockchain.entity";
import {InjectRepository} from "@nestjs/typeorm";

@Injectable()
export class QueueTask {
  private schedulerRegistry
  private service
  constructor(
    private serv:object,
    @InjectRepository(RequestEntity)
    private requestRepository: Repository<RequestEntity>)
  {
    this.service = serv
    this.schedulerRegistry = new SchedulerRegistry()
  }

  @Cron('* * * * * *')
  async taskMonitoringNewTx() {
    try {
      const bdRecord = await getRepository(BlockchainEntity)
        .createQueryBuilder()
        .where({status: 'new'})
        .getOne();
      const account = this.service.get
      let summaryCoins = BigInt(0)
      for (let i = 0; i < Object.keys(bdRecord.result).length; i++) {
        if (this.service.isAddress(bdRecord.result[i].to) !== true) {
          return `${bdRecord.result[i].to} is wrong address!`
        }
        summaryCoins += BigInt(bdRecord.result[i].value)
        await this.requestRepository.save({
          status: 'new', idBlEnt: bdRecord.id, finalSum: summaryCoins.toString(),
          prKey: account.privateKey, address: account.address, date: new Date()
        })
      }
    }
    catch {
      return 0
    }
  }
  @Cron('* * * * * *')
  async taskPayingSumCheck() {
    try {
      const queue = await getRepository(RequestEntity)
        .createQueryBuilder()
        .where({status: 'new'})
        .getMany();
      for (let i = 0; i < queue.length; i++) {
        const balance = BigInt(await this.service.getBalance(queue[i].address))
        if (balance >= BigInt(queue[i].finalSum)) {
          await getConnection()
            .createQueryBuilder()
            .update(RequestEntity)
            .set({status: 'payed', date: new Date()})
            .where({id: queue[i].id})
            .execute();
          const hash = await this.service.sendTx()
          await getConnection()
            .createQueryBuilder()
            .update(BlockchainEntity)
            .set({status: 'submitted', txHash: hash, date: new Date()})
            .where({id: queue[i].idBlEnt})
            .execute();
        }
        if (Number(new Date()) - Number(queue[i].date) > 3600000 && queue[i].status === 'new') {
          await getConnection()
            .createQueryBuilder()
            .update(RequestEntity)
            .set({status: "expired", date: new Date()})
            .where({id: queue[i].id})
            .execute();
          await getConnection()
            .createQueryBuilder()
            .update(RequestEntity)
            .set({status: 'expired', date: new Date()})
            .where({id: queue[i].idBlEnt})
            .execute();
        }
      }
    }
    catch{
      return 0
    }
  }
}


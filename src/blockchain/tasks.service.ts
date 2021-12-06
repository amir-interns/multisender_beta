import { Injectable} from "@nestjs/common";
import { CronJob } from "cron";
import { SchedulerRegistry } from "@nestjs/schedule";
import {getConnection, getRepository} from "typeorm";
import {RequestEntity} from "src/entity/request.entity";
import {BlockchainEntity} from "src/entity/blockchain.entity";


@Injectable()
export class BlockchainTask {
  private schedulerRegistry
  private service
  constructor(private serv:object,
  )
  { this.service=serv
    this.schedulerRegistry = new SchedulerRegistry()
  }
  async sendTx(send:object) {
    const res = await this.service.sendTx(send)
    const result = await this.searchPayedReq()
    return [res[0], res[1]]
  }

  async searchPayedReq(){
    const job = new CronJob(`* * * * * *`, async() => {
      const queue = await getRepository(RequestEntity)
        .createQueryBuilder()
        .getMany()
      for (let i = 0; i < queue.length; i++) {
        if (queue[i].status === 'payed') {
          await getConnection()
            .createQueryBuilder()
            .update(RequestEntity)
            .set({status: 'sended', date: new Date()})
            .where({id: queue[i].id})
            .execute();
          const res = await this.service.sendSubmitTX(queue[i].idBlEnt)
          this.confirmatetJob(res)
        }
        if (Number(new Date())- Number(queue[i].date) > 3600000 && queue[i].status === 'new'){
          await getConnection()
            .createQueryBuilder()
            .update(RequestEntity)
            .set({status: 'expired', date: new Date()})
            .where({id: queue[i].id})
            .execute();
          await getConnection()
            .createQueryBuilder()
            .update(BlockchainEntity)
            .set({status: 'expired', date: new Date()})
            .where({id: queue[i].idBlEnt})
            .execute();
        }
      }
  })
    job.start()
  }
  async confirmatetJob(hash){
    const job = new CronJob(`* * * * * *`, async() => {
      if (await this.service.checkTx(hash)) {
        this.schedulerRegistry.deleteCronJob(hash)
      }
    })
    this.schedulerRegistry.addCronJob(hash,job)
    job.start()
  }
}

import { Injectable} from "@nestjs/common";
import { CronJob } from "cron";
import { SchedulerRegistry } from "@nestjs/schedule";


@Injectable()
export class BlockchainTask {
  private schedulerRegistry
  private service
  constructor(private serv:object,
  )
  { this.service = serv
    this.schedulerRegistry = new SchedulerRegistry()
  }
  async sendTx(send:object) {
    const res = await this.service.sendTx(send)
    const result = await this.searchPayedReq()
    return [res[0], res[1]]
  }

  async searchPayedReq(){
    const job = new CronJob(`* * * * * *`, async() => {
      const queue = await this.service.bdService.getManyRequestRecords()
      for (let i = 0; i < queue.length; i++) {
        if (queue[i].status === 'payed') {
          await this.service.bdService.updateQueue(queue[i].id,'sended')
          const res = await this.service.sendSubmitTX(queue[i].idBlEnt)
          await this.confirmatetJob(res)
        }
        if (Number(new Date()) - Number(queue[i].date) > 3600000 && queue[i].status === 'new'){
          await this.service.bdService.updateQueue(queue[i].id,'expired')
          await this.service.bdService.epiredBlockchain(queue[i].idBlEnt)
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

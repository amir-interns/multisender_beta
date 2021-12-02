import { Injectable} from "@nestjs/common";
import { CronJob } from "cron";
import { SchedulerRegistry } from "@nestjs/schedule";
const BigNumber = require('bignumber.js')

@Injectable()
export class BlockchainTask {
  private schedulerRegistry
  private service
  constructor(private serv:object)
  {
    this.service=serv
    this.schedulerRegistry = new SchedulerRegistry()
  }
  async sendTx(send:object) {
    const res = await this.service.sendTx(send)
    this.taskPayingSumCheck(res[0], res[1], res[2])
    return [res[0], res[1].toString()]
  }
  async taskPayingSumCheck(address:string, sum:number, id:number){
    let count = 0
    const job = new CronJob(`50 * * * * *`, async() => {
      count += 1
      const balance = BigInt(await this.service.getBalance(address))
      if ( balance >= sum){
        this.schedulerRegistry.deleteCronJob(address)
        const hash = await this.service.sendSubmitTX()
        this.service.delApplication(id)
        this.confiramtJob(hash)
      }
      if (count >= 60){
        this.schedulerRegistry.deleteCronJob(address)
        this.service.delApplication(id)
      }
    })
    this.schedulerRegistry.addCronJob(address,job)
    job.start()
  }
  async confiramtJob(hash){
    const job = new CronJob(`50 * * * * *`, async() => {
      await this.service.checkTx(hash)
      if (this.service.checkTx(hash)) {
        this.schedulerRegistry.deleteCronJob(hash)
      }
    })
    this.schedulerRegistry.addCronJob(hash,job)
    job.start()
  }
}

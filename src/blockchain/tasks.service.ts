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
    const job = new CronJob(`1 * * * * *`, async() => {
      const balance = BigInt(await this.service.getBalance(address))
      console.log(balance >= sum)
      if ( balance >= sum){
        console.log('ok')
        this.schedulerRegistry.deleteCronJob(address)
        const hash = await this.service.sendSubmitTX()
        this.confiramtJob(hash)
      }
    })
    this.schedulerRegistry.addCronJob(address,job)
    job.start()
  }
  async confiramtJob(hash){
    const job = new CronJob(`1 * * * * *`, async() => {
      await this.service.checkTx(hash)
      if (this.service.checkTx(hash)) {
        this.schedulerRegistry.deleteCronJob(hash)
      }
    })
    this.schedulerRegistry.addCronJob(hash,job)
    job.start()
  }
}

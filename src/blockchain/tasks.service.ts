import { Injectable, Inject } from "@nestjs/common";
import { CronJob } from "cron";
import { SchedulerRegistry } from "@nestjs/schedule";

@Injectable()
export class BlockchainTask {
  private schedulerRegistry
  constructor(@Inject('Type') private service)
  {
    this.schedulerRegistry = new SchedulerRegistry()
  }
  async sendTx(send:object) {
    const hash = await this.service.sendTx(send)
    const seconds = 10

    const job = new CronJob(`${seconds}  * * * * *`, async() => {
      const res = await this.service.checkTx(hash)
      if (this.service.checkTx(hash)) {
        this.schedulerRegistry.deleteCronJob(hash)
      }
    })
    this.schedulerRegistry.addCronJob(hash,job)
    job.start()
  }
}

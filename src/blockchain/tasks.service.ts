import { Injectable} from "@nestjs/common";
import { CronJob } from "cron";
import { SchedulerRegistry } from "@nestjs/schedule";

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
    const hash = await this.service.sendTx(send)
    const seconds = 10

    const job = new CronJob(`${seconds}  * * * * *`, async() => {
      await this.service.checkTx(hash)
      if (this.service.checkTx(hash)) {
        this.schedulerRegistry.deleteCronJob(hash)
      }
    })
    this.schedulerRegistry.addCronJob(hash,job)
    job.start()
  }
}

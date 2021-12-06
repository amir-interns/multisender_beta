import { Injectable} from "@nestjs/common";
import { CronJob } from "cron";
import { SchedulerRegistry } from "@nestjs/schedule";
import {QueueService} from "src/queue/queue.service";


@Injectable()
export class QueueTask {
  private schedulerRegistry
  constructor(
    private queueService: QueueService)
  {
    this.schedulerRegistry = new SchedulerRegistry()
  }

  async taskPayingSumCheck(){
    let count = 0
    const job = new CronJob(`* * * * * *`, async() => {
      count += 1
      const queue = await this.queueService.findAll()
      for (let i = 0; i < queue.length; i++){
        const balance = BigInt(await this.queueService.getBalance(queue[i].address))
        if ( balance >= BigInt(queue[i].finalSum)){
          this.queueService.updateQueue(queue[i].id, 'payed')
        }
      }
    })
    job.start()
  }
}

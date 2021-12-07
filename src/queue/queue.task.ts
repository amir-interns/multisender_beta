import { Injectable} from "@nestjs/common";
import { CronJob } from "cron";
import { SchedulerRegistry } from "@nestjs/schedule";
import {BdService} from "src/queue/bd.service";
import { EthereumService } from 'src/blockchain/ethereum.service';


@Injectable()
export class QueueTask {
  private schedulerRegistry
  private service
  constructor(
    private serv:object)
  {
    this.service = serv
    this.schedulerRegistry = new SchedulerRegistry()
  }

  async taskPayingSumCheck(){
    let count = 0
    const job = new CronJob(`* * * * * *`, async() => {
      count += 1
      const queue = await this.service.bdService.findAllNewRequest()
      for (let i = 0; i < queue.length; i++){
        const balance = BigInt(await this.service.getBalance(queue[i].address))
        if ( balance >= BigInt(queue[i].finalSum)){
          this.service.bdService.updateQueue(queue[i].id, 'payed')
        }
      }
    })
    job.start()
  }
}

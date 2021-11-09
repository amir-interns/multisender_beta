
import { Injectable } from "@nestjs/common";
import { CronJob } from "cron";
import { SchedulerRegistry } from "@nestjs/schedule";
import { BlockchainEntity } from "../../bd/src/entity/blockchain.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import {getConnection} from "typeorm";
import {ConfigService} from "@nestjs/config";
const Web3 = require('web3')
// const conf = require('./configServices/UsdtConfig.json')

@Injectable()
export class TasksUsdtService {
  private ws
  private https

  constructor(@InjectRepository(BlockchainEntity)
              private blockchainRepository: Repository<BlockchainEntity>,
              private schedulerRegistry: SchedulerRegistry,
              private tokenConfig:ConfigService) {
    this.ws=tokenConfig.get<string>('TokenConfig.tokenWebSocketInfura')
    this.https=tokenConfig.get<string>('TokenConfig.tokenHttps')
  }


  addCronJob(hash: string, id) {

    const web3 = new Web3(this.ws)
    const job = new CronJob(`10 * * * * *`, () => {
      let receipt = web3.eth.getTransactionReceipt(hash).then( async (value)=> {
        let blockN=parseInt(value.blockNumber)
        if (blockN >= 3) {
          let today=new Date()
          await getConnection()
            .createQueryBuilder()
            .update(BlockchainEntity)
            .set({ status:'confirmed', date:String(today)})
            .where({id})
            .execute();
          this.deleteCron(hash)
        }
      })
    });

    this.schedulerRegistry.addCronJob(hash, id)
    job.start();
  }

  deleteCron(name: string) {
    this.schedulerRegistry.deleteCronJob(name);
  }


}


import { Injectable } from "@nestjs/common";
import { CronJob } from "cron";
import { SchedulerRegistry } from "@nestjs/schedule";
import { BlockchainEntity } from "../../bd/src/entity/blockchain.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import {getConnection} from "typeorm";
import {ConfigService} from "@nestjs/config";
const Web3 = require('web3')



@Injectable()
export class TasksEthService {
  private https
  private web3

  constructor(@InjectRepository(BlockchainEntity)
              private blockchainRepository: Repository<BlockchainEntity>,
              private schedulerRegistry: SchedulerRegistry,
              private ethconfig:ConfigService) {
    this.https=ethconfig.get<string>('EthereumConfig.https')
    this.web3=new Web3(this.https);
  }


  addCronJob(hash: string, id) {
    const job = new CronJob(`10 * * * * *`, () => {
      let receipt = this.web3.eth.getTransactionReceipt(hash).then( async (value)=> {
        let blockN=parseInt(value.blockNumber)
        if (blockN >= 3) {
          let today=new Date()
          await getConnection()
            .createQueryBuilder()
            .update(BlockchainEntity)
            .set({ status:'confirmed', date:today})
            .where({id})
            .execute();
          this.deleteCron(hash)
        }
      })
    });

    this.schedulerRegistry.addCronJob(hash, id);
    job.start();
  }

  deleteCron(name: string) {
    this.schedulerRegistry.deleteCronJob(name);
  }


}


import { Injectable } from "@nestjs/common";
import { CronJob } from "cron";
import { SchedulerRegistry } from "@nestjs/schedule";
import { BlockchainEntity } from "../../../bd/src/entity/blockchain.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import {getConnection} from "typeorm";
import {ConfigService} from "@nestjs/config";
import {EthereumService} from "../ethereum.service";
import {UsdtService} from "../usdt.service";
const Web3 = require('web3')

interface IEthService {
  sendTx(body: object): object;
}

@Injectable()
export class TasksEthService {


  constructor(@InjectRepository(BlockchainEntity)
              private blockchainRepository: Repository<BlockchainEntity>,
              private schedulerRegistry: SchedulerRegistry,
              private ethconfig:ConfigService,
              private ethereumService: EthereumService,
              private usdtService: UsdtService) {
  }


  async send (send, type){
    const service= type=='eth' ? this.ethereumService : this.usdtService
    const res= await service.sendTx(send)
    this.addCronJob(res[0], res[1], res[2])
  }

  addCronJob(hash, id,web3) {
    const job = new CronJob(`10 * * * * *`, () => {
      web3.eth.getTransactionReceipt(hash).then( async (value)=> {
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

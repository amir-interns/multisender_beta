import { Injectable } from "@nestjs/common";
import { Cron } from '@nestjs/schedule';
import { CronJob } from "cron";
import { SchedulerRegistry } from "@nestjs/schedule";
import { BlockchainEntity } from "./blockchain.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
const axios = require("axios")
const sochain_network = "BTCTEST"

@Injectable()
export class TasksService {

    constructor(@InjectRepository(BlockchainEntity)
                private blockchainRepository: Repository<BlockchainEntity>,
                private schedulerRegistry: SchedulerRegistry) {}



    addCronJob(name: string, seconds: string) {
        const job = new CronJob(`${seconds} * * * * *`, () => {
            let confirms = axios.get(`https://sochain.com/api/v2/tx/${sochain_network}/${name}`).then(function(res)  { return res.data.data.confirmations })
            if ((confirms === "1") || (confirms === "2")) {
                let blockchainEntity = new BlockchainEntity()
                blockchainEntity.status = "submitted"
                
            //submitted
            }
            if (Number(confirms) >= 3) {
                //confirmed
                this.deleteCron(name)
            }
            

        });
      
        this.schedulerRegistry.addCronJob(name, job);
        job.start();
      }
    
    
    deleteCron(name: string) {
    this.schedulerRegistry.deleteCronJob(name);
    }
    

}
import { SchedulerRegistry } from "@nestjs/schedule";
import { BlockchainEntity } from "../../bd/src/entity/blockchain.entity";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
export declare class TasksEthService {
    private blockchainRepository;
    private schedulerRegistry;
    private ethconfig;
    private https;
    constructor(blockchainRepository: Repository<BlockchainEntity>, schedulerRegistry: SchedulerRegistry, ethconfig: ConfigService);
    addCronJob(hash: string, id: any): void;
    deleteCron(name: string): void;
}

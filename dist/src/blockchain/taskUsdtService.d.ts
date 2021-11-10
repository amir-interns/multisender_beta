import { SchedulerRegistry } from "@nestjs/schedule";
import { BlockchainEntity } from "../../bd/src/entity/blockchain.entity";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
export declare class TasksUsdtService {
    private blockchainRepository;
    private schedulerRegistry;
    private tokenConfig;
    private ws;
    constructor(blockchainRepository: Repository<BlockchainEntity>, schedulerRegistry: SchedulerRegistry, tokenConfig: ConfigService);
    addCronJob(hash: string, id: any): void;
    deleteCron(name: string): void;
}

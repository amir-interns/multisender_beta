import { BlockchainEntity } from "./blockchain.entity";
import { Repository } from "typeorm";
import { BlockchainDto } from "./dto/blockchain.dto";
import { SchedulerRegistry } from "@nestjs/schedule";
import { ConfigService } from "@nestjs/config";
export declare class BitcoinService {
    private blockchainRepository;
    private schedulerRegistry;
    private configService;
    sochain_network: any;
    privateKey: any;
    sourceAddress: any;
    constructor(blockchainRepository: Repository<BlockchainEntity>, schedulerRegistry: SchedulerRegistry, configService: ConfigService);
    checkTx(txHash: string): Promise<object>;
    getBalance(address: string): Promise<object>;
    sendTx(body: any): Promise<{
        status: any;
        transfers: any[];
    }>;
    findOne(id: string): Promise<BlockchainEntity>;
    create(blockchainDto: BlockchainDto): Promise<number>;
    findAll(): Promise<BlockchainEntity[]>;
    addCronJob(idTx: string, seconds: string, thH: string): void;
    deleteCron(name: string): void;
}

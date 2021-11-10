import { Repository } from "typeorm";
import { BlockchainEntity } from "../../bd/src/entity/blockchain.entity";
import { TasksUsdtService } from "./taskUsdtService";
import { ConfigService } from "@nestjs/config";
export declare class UsdtService {
    private blockchainRepository;
    private taskService;
    private tokenConfig;
    private webSocketInfura;
    private gasLimit;
    private privateKey;
    private addrSender;
    private addrContract;
    constructor(blockchainRepository: Repository<BlockchainEntity>, taskService: TasksUsdtService, tokenConfig: ConfigService);
    getBalance(): Promise<any>;
    sendTx(send: object): Promise<void>;
    updateBd(txHash: any, status: any, result: any): Promise<BlockchainEntity>;
}

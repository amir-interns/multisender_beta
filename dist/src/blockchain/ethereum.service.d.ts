import { BlockchainEntity } from "../../bd/src/entity/blockchain.entity";
import { Repository } from "typeorm";
import { TasksEthService } from "./tasksEth.service";
import { ConfigService } from "@nestjs/config";
export declare class EthereumService {
    private blockchainRepository;
    private tasksService;
    private ethconfig;
    private https;
    private gasPrice;
    private gasLimit;
    private chainId;
    private privateKey;
    private addrSender;
    constructor(blockchainRepository: Repository<BlockchainEntity>, tasksService: TasksEthService, ethconfig: ConfigService);
    sendTx(send: object): Promise<any>;
    sendTrans(send: any, id: any): Promise<void>;
    getBalance(address: any): Promise<any>;
    updateBd(txHash: any, status: any, result: any): Promise<BlockchainEntity>;
}

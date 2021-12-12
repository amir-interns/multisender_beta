import { Module} from '@nestjs/common';
import { EthereumService } from 'src/blockchain/ethereum.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {RequestEntity} from "src/entity/request.entity";
import {QueueTask} from "src/queue/queue.task";
import {BlockchainEntity} from "src/entity/blockchain.entity";
import {ConfigModule} from "@nestjs/config";
import EthereumConfig from "config/ether.config";

import {BitcoinService} from "../blockchain/bitcoin.service";
import {Repository} from "typeorm";
import {BlockchainTask} from "../blockchain/tasks.service";
import {UsdtService} from "../blockchain/usdt.service";
import {TrxService} from "../blockchain/trx.service";
import {Trc20Service} from "../blockchain/trc20.service";
import {BlockchainRepository} from "../blockchain/customBlRep";
import {BlockchainModule} from "../blockchain/blockchain.module";
import {RequestController} from "./request.controller";
import {RequestRepository} from "./request.custom.provider";



@Module({
    imports: [TypeOrmModule.forFeature( [ RequestEntity, BlockchainEntity]),
        ConfigModule.forFeature(EthereumConfig), BlockchainModule],
    providers: [ QueueTask, Object, Repository, RequestRepository,
    ],
    controllers:[RequestController]
})
export class QueueModule {

}

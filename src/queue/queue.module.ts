import { Module} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {RequestEntity} from "src/entity/request.entity";
import {QueueTask} from "src/queue/queue.task";
import {BlockchainEntity} from "src/entity/blockchain.entity";
import {ConfigModule} from "@nestjs/config";
import EthereumConfig from "config/ether.config";
import {Repository} from "typeorm";
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

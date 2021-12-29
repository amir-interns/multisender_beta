import {Logger, Module} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {RequestEntity} from "src/entities/request.entity";
import {RequestTask} from "src/request/request.task";
import {BlockchainEntity} from "src/entities/blockchain.entity";
import {ConfigModule} from "@nestjs/config";
import EthereumConfig from "config/ether.config";
import {Repository} from "typeorm";
import {BlockchainModule} from "../blockchain/blockchain.module";
import {RequestController} from "./request.controller";
import {RequestRepository} from "./request.custom.provider";
import {Subscriber} from "../entities/subscriber";


@Module({
    imports: [TypeOrmModule.forFeature( [ RequestEntity, BlockchainEntity]),
        ConfigModule.forFeature(EthereumConfig), BlockchainModule],
    providers: [ RequestTask, Object, Repository, RequestRepository,Subscriber, Logger
    ],
    controllers:[RequestController]
})
export class RequestModule {

}

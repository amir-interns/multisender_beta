import { Module} from '@nestjs/common';
import { EthereumService } from 'src/blockchain/ethereum.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {RequestEntity} from "src/entity/request.entity";
import {QueueTask} from "src/queue/queue.task";
import {BlockchainEntity} from "src/entity/blockchain.entity";
import {ConfigModule} from "@nestjs/config";
import EthereumConfig from "config/ether.config";
import {BdService} from "src/queue/bd.service";


@Module({
    imports: [TypeOrmModule.forFeature( [ RequestEntity, BlockchainEntity]),
        ConfigModule.forFeature(EthereumConfig)],
    providers: [ QueueTask, EthereumService, BdService, Object]
})
export class QueueModule {

}

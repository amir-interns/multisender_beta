import { Module, forwardRef } from '@nestjs/common';
import { BitcoinService } from './bitcoin.service';
import { BlockchainController } from './blockchain.controller';
import { EthereumService } from './ethereum.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockchainEntity } from "../../bd/src/entity/blockchain.entity";
import { TasksService } from './tasks/tasks.service';
import { UsdtService } from './usdt.service';
import {Auth} from "../../bd/src/entity/Auth";
import {AuthModule} from "../auth/auth.module";
import {BlockchainTask} from "./tasks/tasksEth.service";
import { ConfigModule } from '@nestjs/config';
import BitcoinConfig from 'config/bitcoin'
import EthereumConfig from 'config/etherConfig'
import TokenConfig from 'config/tokenConfig'
import {ScheduleModule} from "@nestjs/schedule";



@Module({
    imports: [TypeOrmModule.forFeature( [ BlockchainEntity, Auth ]), AuthModule, ConfigModule.forFeature(BitcoinConfig),
        ConfigModule.forFeature(TokenConfig), ConfigModule.forFeature(EthereumConfig), ScheduleModule.forRoot()],
    providers: [ BitcoinService, TasksService, UsdtService, EthereumService, BlockchainTask, {
        provide: 'Type', // this can be a symbol or a string
        useValue: 'eth',
    }],
    controllers: [BlockchainController],

})
export class BlockchainModule {
}

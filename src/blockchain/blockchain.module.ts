import { Module, forwardRef } from '@nestjs/common';
import { BitcoinService } from './bitcoin.service';
import { BlockchainController } from './blockchain.controller';
import { EthereumService } from './ethereum.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockchainEntity } from "../../bd/src/entity/blockchain.entity";
import { TasksService } from './tasks.service';
import { UsdtService } from './usdt.service';
import {Auth} from "../../bd/src/entity/Auth";
import {AuthModule} from "../auth/auth.module";
import {TasksEthService} from "./tasksEth.service";
import {TasksUsdtService} from "./taskUsdtService";

@Module({
    imports: [TypeOrmModule.forFeature( [ BlockchainEntity, Auth ]), AuthModule],
    providers: [ BitcoinService, EthereumService, TasksService, UsdtService, TasksEthService, TasksUsdtService ],
    controllers: [BlockchainController],
})
export class BlockchainModule {
    

}

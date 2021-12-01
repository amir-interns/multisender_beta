import { Module, forwardRef } from '@nestjs/common';
import { BitcoinService } from './bitcoin.service';
import { BlockchainController } from './blockchain.controller';
import { EthereumService } from './ethereum.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockchainEntity } from 'src/entity/blockchain.entity';
import { UsdtService } from 'src/blockchain/usdt.service';
import { AuthEntity } from 'src/entity/auth.entity';
import {AuthModule} from "src/auth/auth.module";
import { ConfigModule } from '@nestjs/config';
import BitcoinConfig from 'config/bitcoin.config'
import EthereumConfig from 'config/ether.config'
import TokenConfig from 'config/tokensEth.config'
import {BlockchainTask} from "src/blockchain/tasks.service";
import { TrxService } from './trx.service';
import { Trc20Service } from './trc20.service';
import { BlockchainService } from './blockchain.service';

@Module({
    imports: [TypeOrmModule.forFeature( [ BlockchainEntity, AuthEntity ]), AuthModule,
        ConfigModule.forFeature(BitcoinConfig), ConfigModule.forFeature(TokenConfig),
        ConfigModule.forFeature(EthereumConfig)],
    providers: [ BitcoinService, EthereumService, UsdtService, BlockchainTask, {provide:'Type', useValue:''}, TrxService, Trc20Service, BlockchainService],
    controllers: [BlockchainController],
})
export class BlockchainModule {

}

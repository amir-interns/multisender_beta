import { Module} from '@nestjs/common';
import { BitcoinService } from 'src/blockchain/bitcoin.service';
import { EthereumService } from 'src/blockchain/ethereum.service';
import {InjectRepository, TypeOrmModule} from '@nestjs/typeorm';
import { BlockchainEntity } from 'src/entity/blockchain.entity';
import { UsdtService } from 'src/blockchain/usdt.service';
import { AuthEntity } from 'src/entity/auth.entity';
import {AuthModule} from "src/auth/auth.module";
import { ConfigModule } from '@nestjs/config';
import BitcoinConfig from 'config/bitcoin.config'
import EthereumConfig from 'config/ether.config'
import TokenConfig from 'config/tokensEth.config'
import {BlockchainTask} from "src/blockchain/tasks.service";
import { TrxService } from 'src/blockchain/trx.service';
import { Trc20Service } from 'src/blockchain/trc20.service';
import {RequestEntity} from "src/entity/request.entity";
import {Connection, Repository} from "typeorm";
import {BlockchainRepository} from "./customBlRep";


@Module({
    imports: [TypeOrmModule.forFeature( [ BlockchainEntity, AuthEntity, RequestEntity]), AuthModule,
        ConfigModule.forFeature(BitcoinConfig), ConfigModule.forFeature(TokenConfig),
        ConfigModule.forFeature(EthereumConfig)],
    providers: [ BitcoinService, EthereumService, UsdtService, BlockchainTask, TrxService, Trc20Service,Object,
        BlockchainEntity, Repository, BlockchainRepository],
    exports:[EthereumService, BitcoinService, UsdtService, Trc20Service,TrxService,]
})
export class BlockchainModule {

}

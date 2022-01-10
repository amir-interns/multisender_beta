import {Logger, Module} from '@nestjs/common';
import { BitcoinService } from 'src/blockchain/bitcoin.service';
import { EthereumService } from 'src/blockchain/ethereum.service';
import { TypeOrmModule} from '@nestjs/typeorm';
import { BlockchainEntity } from 'src/entities/blockchain.entity';
import { UsdtService } from 'src/blockchain/usdt.service';
import { ConfigModule } from '@nestjs/config';
import BitcoinConfig from 'config/bitcoin.config'
import EthereumConfig from 'config/ether.config'
import TokenConfig from 'config/tokensEth.config'
import Trc20Config from 'config/trc20'
import TrxConfig from 'config/trx'
import {BlockchainTask} from "src/blockchain/tasks.service";
import { TrxService } from 'src/blockchain/trx.service';
import { Trc20Service } from 'src/blockchain/trc20.service';
import { Repository} from "typeorm";



@Module({
    imports: [TypeOrmModule.forFeature( [ BlockchainEntity]),
        ConfigModule.forFeature(BitcoinConfig), ConfigModule.forFeature(TokenConfig),
        ConfigModule.forFeature(EthereumConfig), ConfigModule.forFeature(Trc20Config),
    ConfigModule.forFeature(TrxConfig)],
    providers: [ BitcoinService, EthereumService, UsdtService, BlockchainTask, TrxService, Trc20Service,Object,
        BlockchainEntity, Repository, Logger],
    exports:[EthereumService, BitcoinService, UsdtService, Trc20Service,TrxService,]
})
export class BlockchainModule {

}

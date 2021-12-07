import { Module} from '@nestjs/common';
import { BitcoinService } from 'src/blockchain/bitcoin.service';
import { BlockchainController } from 'src/blockchain/blockchain.controller';
import { EthereumService } from 'src/blockchain/ethereum.service';
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
import { TrxService } from 'src/blockchain/trx.service';
import { Trc20Service } from 'src/blockchain/trc20.service';
import {RequestEntity} from "src/entity/request.entity";
import {QueueTask} from "src/queue/queue.task";
import {BdService} from "src/queue/bd.service";


@Module({
    imports: [TypeOrmModule.forFeature( [ BlockchainEntity, AuthEntity, RequestEntity]), AuthModule,
        ConfigModule.forFeature(BitcoinConfig), ConfigModule.forFeature(TokenConfig),
        ConfigModule.forFeature(EthereumConfig)],
    providers: [ BitcoinService, EthereumService, UsdtService, BlockchainTask, TrxService, Trc20Service,Object,
      QueueTask, BdService,
        {
            provide:'btc', useFactory: (btcSevice:BitcoinService)=>{
                return [new BlockchainTask(btcSevice), new QueueTask(btcSevice)]
            },
            inject: [BitcoinService]
        },
        {
            provide:'eth', useFactory: async (ethService:EthereumService)=>{
                return [new BlockchainTask(ethService), new QueueTask(ethService)]
            },
            inject: [EthereumService]
        },
        {
            provide:'usdt', useFactory: (usdtService:UsdtService)=>{
                return [new BlockchainTask(usdtService), new QueueTask(usdtService)]
            },
            inject: [UsdtService]
        },
        {
            provide:'trx', useFactory: (trxService:TrxService)=>{
                return [new BlockchainTask(trxService), new QueueTask(trxService)]
            },
            inject: [TrxService]
        },
        {
            provide:'trc20', useFactory: (trc20Service:Trc20Service)=>{
                return [new BlockchainTask(trc20Service),  new QueueTask(trc20Service)]
            },
            inject: [Trc20Service]
        },
    ],
    controllers: [BlockchainController],
    exports:[]
})
export class BlockchainModule {

}

import { Module} from '@nestjs/common';
import { BitcoinService } from 'src/blockchain/bitcoin.service';
import { BlockchainController } from 'src/blockchain/blockchain.controller';
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
import {QueueTask} from "src/queue/queue.task";
import {BdService} from "src/queue/bd.service";
import {Connection, Repository} from "typeorm";


@Module({
    imports: [TypeOrmModule.forFeature( [ BlockchainEntity, AuthEntity, RequestEntity]), AuthModule,
        ConfigModule.forFeature(BitcoinConfig), ConfigModule.forFeature(TokenConfig),
        ConfigModule.forFeature(EthereumConfig)],
    providers: [ BitcoinService, EthereumService, UsdtService, BlockchainTask, TrxService, Trc20Service,Object,
        BdService,BlockchainEntity, Repository,

        // {
        //     provide:'btc', useFactory: (btcSevice:BitcoinService, blockchainRepository: Repository<BlockchainEntity>)=>{
        //         return new BlockchainTask(btcSevice)
        //     },
        //     inject: [BitcoinService]
        // },
        {
            provide:'eth', useFactory: async (ethService:EthereumService,  blockchainRepository:Repository<BlockchainEntity>)=>{
                InjectRepository(BlockchainEntity)
                return new BlockchainTask(ethService, blockchainRepository)
            },
            inject: [EthereumService, Repository, BlockchainEntity]
        },
        // {
        //     provide:'usdt', useFactory: (usdtService:UsdtService,blockchainRepository: Repository<BlockchainEntity>)=>{
        //         return new BlockchainTask(usdtService)
        //     },
        //     inject: [UsdtService]
        // },
        // {
        //     provide:'trx', useFactory: (trxService:TrxService,blockchainRepository: Repository<BlockchainEntity>)=>{
        //         return new BlockchainTask(trxService)
        //     },
        //     inject: [TrxService]
        // },
        // {
        //     provide:'trc20', useFactory: (trc20Service:Trc20Service,blockchainRepository: Repository<BlockchainEntity>)=>{
        //         return new BlockchainTask(trc20Service)
        //     },
        //     inject: [Trc20Service]
        // },
    ],
    controllers: [BlockchainController],
    exports:[]
})
export class BlockchainModule {

}

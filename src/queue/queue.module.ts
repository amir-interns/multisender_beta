import { Module} from '@nestjs/common';
import { EthereumService } from 'src/blockchain/ethereum.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {RequestEntity} from "src/entity/request.entity";
import {QueueTask} from "src/queue/queue.task";
import {BlockchainEntity} from "src/entity/blockchain.entity";
import {ConfigModule} from "@nestjs/config";
import EthereumConfig from "config/ether.config";
import {BdService} from "src/queue/bd.service";
import {BitcoinService} from "../blockchain/bitcoin.service";
import {Repository} from "typeorm";
import {BlockchainTask} from "../blockchain/tasks.service";
import {UsdtService} from "../blockchain/usdt.service";
import {TrxService} from "../blockchain/trx.service";
import {Trc20Service} from "../blockchain/trc20.service";
import {BlockchainRepository} from "../blockchain/CustomBlRep";
import {RequestRepository} from "./CustomQueueRep";


@Module({
    imports: [TypeOrmModule.forFeature( [ RequestEntity, BlockchainEntity]),
        ConfigModule.forFeature(EthereumConfig)],
    providers: [ QueueTask, EthereumService, BitcoinService, UsdtService, TrxService, Trc20Service,
        Object, BdService,RequestRepository, Repository,
        // BitcoinService, UsdtService, TrxService, Trc20Service,
        // {
        //     provide:'btc', useFactory: (btcSevice:BitcoinService, blockchainRepository: Repository<RequestEntity>)=>{
        //         return new QueueTask(btcSevice,blockchainRepository)
        //     },
        //     inject: [BitcoinService]
        // },
        // {
        //     provide:'eth', useFactory: async (ethService:EthereumService,  blockchainRepository:RequestRepository,
        //                                       btcService:BitcoinService, usdtService:UsdtService,
        //                                       trxService:TrxService, trc20Service:Trc20Service)=>{
        //         return new QueueTask(blockchainRepository.rep,  btcService, ethService,usdtService, trxService, trc20Service)
        //     },
        //     inject: [EthereumService,RequestRepository]
        // },
        // {
        //     provide:'usdt', useFactory: (usdtService:UsdtService,blockchainRepository: Repository<RequestEntity>)=>{
        //         return new QueueTask(usdtService,blockchainRepository)
        //     },
        //     inject: [UsdtService]
        // },
        // {
        //     provide:'trx', useFactory: (trxService:TrxService,blockchainRepository: Repository<RequestEntity>)=>{
        //         return new QueueTask(trxService,blockchainRepository)
        //     },
        //     inject: [TrxService]
        // },
        // {
        //     provide:'trc20', useFactory: (trc20Service:Trc20Service,blockchainRepository: Repository<RequestEntity>)=>{
        //         return new QueueTask(trc20Service,blockchainRepository)
        //     },
        //     inject: [Trc20Service]
        // },
    ]
})
export class QueueModule {

}

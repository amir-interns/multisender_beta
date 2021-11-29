import { Module} from '@nestjs/common';
import { BitcoinService } from 'src/blockchain/bitcoin.service';
import { BlockchainController } from 'src/blockchain/blockchain.controller';
import { EthereumService } from 'src/blockchain//ethereum.service';
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


@Module({
    imports: [TypeOrmModule.forFeature( [ BlockchainEntity, AuthEntity ]), AuthModule,
        ConfigModule.forFeature(BitcoinConfig), ConfigModule.forFeature(TokenConfig),
        ConfigModule.forFeature(EthereumConfig)],
    providers: [ BitcoinService, EthereumService, UsdtService, BlockchainTask, Object,
        {
            provide:'btc', useFactory: (btcSevice:BitcoinService)=>{
                return new BlockchainTask(btcSevice)
            },
            inject: [BitcoinService, BlockchainTask]
        },
        {
            provide:'eth', useFactory: async (ethService:EthereumService)=>{
                return new BlockchainTask(ethService)
            },
            inject: [EthereumService, BlockchainTask]
        },
        {
            provide:'usdt', useFactory: (usdtService:UsdtService)=>{
                return new BlockchainTask(usdtService)
            },
            inject: [UsdtService]
        }
        ],
    controllers: [BlockchainController],
})
export class BlockchainModule {
    

}

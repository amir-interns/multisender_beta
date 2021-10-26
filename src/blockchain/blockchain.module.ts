import { Module, forwardRef } from '@nestjs/common';
import { BitcoinService } from './bitcoin.service';
import { BlockchainController } from './blockchain.controller';
import { EtheriumService } from './ethereum.service';
import { BlockchainService } from './blockchain.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockchainEntity } from './blockchain.entity';
import { TasksService } from './tasks.service';
import { UsdtService } from './usdt.service';


@Module({
    imports: [TypeOrmModule.forFeature( [ BlockchainEntity ])],
    providers: [ BitcoinService, EtheriumService, BlockchainService, TasksService, UsdtService ],
    controllers: [BlockchainController],
})
export class BlockchainModule {
    

}

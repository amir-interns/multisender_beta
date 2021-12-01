import { Injectable } from '@nestjs/common'
import { Repository } from 'typeorm';
import { BlockchainEntity } from 'src/entity/blockchain.entity';
import { InjectRepository } from '@nestjs/typeorm'

@Injectable()
export class BlockchainService {
    constructor(@InjectRepository(BlockchainEntity)
                private blockchainRepository:Repository<BlockchainEntity>) {}
    
    async findAll(): Promise<BlockchainEntity[]> {
        const txs = await this.blockchainRepository.find()
        return txs
    }
}
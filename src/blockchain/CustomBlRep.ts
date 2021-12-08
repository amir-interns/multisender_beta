import {BlockchainEntity} from "../entity/blockchain.entity";
import {EntityRepository, Repository} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";
import {RequestEntity} from "../entity/request.entity";


@EntityRepository(BlockchainEntity)
export class BlockchainRepository extends Repository<BlockchainEntity> {
  constructor(@InjectRepository(BlockchainEntity)
              public rep: Repository<BlockchainEntity>) {
    super();
  }
}


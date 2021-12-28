import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
  AfterLoad,
  Repository,
  Connection,
  getConnection
} from "typeorm";
import {RequestEntity} from "./request.entity";
import {InjectConnection, InjectRepository} from "@nestjs/typeorm";
import {BlockchainEntity} from "./blockchain.entity";
import { OnEvent } from '@nestjs/event-emitter';

@EventSubscriber()
export class Subscriber implements EntitySubscriberInterface<RequestEntity>
{
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
    @InjectRepository(BlockchainEntity)
    public blockchainRepository:Repository<BlockchainEntity>)
  {
  connection.subscribers.push(this)
  }
  async afterUpdate(event: UpdateEvent<RequestEntity>) {
    if (event.entity.status === 'payed'){
      const ent = new BlockchainEntity()
      ent.status='new'
      ent.typeCoin = event.entity.typeCoin
      ent.result = event.entity.result
      ent.Request = event.entity.id
      ent.date= new Date()
      await this.blockchainRepository.save(ent)
    }
  }
}
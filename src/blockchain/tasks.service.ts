import { Injectable} from "@nestjs/common";
import { CronJob } from "cron";
import {Cron, SchedulerRegistry} from "@nestjs/schedule";
import {InjectRepository} from "@nestjs/typeorm";
import {BlockchainEntity} from "../entity/blockchain.entity";
import {Connection, getConnection, getRepository, Repository} from "typeorm";
import {RequestEntity} from "../entity/request.entity";
import {EthereumService} from "./ethereum.service";
import {BlockchainRepository} from "./customBlRep";
import {UsdtService} from "./usdt.service";
import {BitcoinService} from "./bitcoin.service";
import {TrxService} from "./trx.service";
import {Trc20Service} from "./trc20.service";


//Move enum and Interface to another file from both tasks
enum Service {
  Bitcoin = 'btc',
  Ethereum = 'eth',
  ERC20 = 'usdt',
  TRC20 = 'trc20',
  Tron = 'trx'
}

interface IBlockchainService {
  sendTx(address:string, key:string, send: object): any;
  getBalance(address: string): Promise<any>;
  createNewAccount();
  isAddress(address:string);
  getFee(body?:object);
  checkTx(hash:string)
}

@Injectable()
export class BlockchainTask {
  constructor(@InjectRepository(BlockchainEntity)
              private blockchainRepository:Repository<BlockchainEntity>,
              @InjectRepository(RequestEntity)
              private requestRepository:Repository<RequestEntity>,
              private ethService:EthereumService,
              private usdtService:UsdtService,
              private btcService:BitcoinService,
              private trxService: TrxService,
              private trc20Servcie:Trc20Service)
  { }

  @Cron('* * * * * *')
  async searchPayedRequest() {
    try {
      const payedBlAntity = await getRepository(RequestEntity).findOne({where: {status: 'payed'}})
      const service = this.getService(payedBlAntity.typeCoin)
      await getConnection()
        .createQueryBuilder()
        .update(RequestEntity)
        .set({status: 'done'})
        .where({id: payedBlAntity.id})
        .execute();
      const hash = await service.sendTx(payedBlAntity.address, payedBlAntity.prKey, payedBlAntity.result)
      await this.blockchainRepository.save({
        typeCoin:'eth', status: 'submitted',
        result: payedBlAntity.result, date: new Date(),
        txHash: hash
      })
    }
    catch{
      return 0
    }
  }
  @Cron('* * * * * *')
  async confirmateJob() {
    try {
      const bdRecord = await getRepository(BlockchainEntity)
        .createQueryBuilder()
        .where({status: 'submitted'})
        .getMany();
      for (let i=0; i <= bdRecord.length; i++) {
        const service = this.getService(bdRecord[i].typeCoin)
        if (await service.checkTx(bdRecord[i].txHash)) {
          await getConnection()
            .createQueryBuilder()
            .update(BlockchainEntity)
            .set({status: 'confirmed'})
            .where({id: bdRecord[i].id})
            .execute();
        }
      }
    }
    catch{
      return 0
    }
  }

  getService(type){
    let service:IBlockchainService
    switch(type) {
      case Service.Ethereum: {
        service = this.ethService
        return service
        break;
      }
      case Service.Bitcoin: {
        service = this.btcService
        return service
        break;
      }
      case Service.ERC20: {
        service = this.usdtService
        return service
        break;
      }
      case Service.Tron: {
        service = this.trxService
        return service
        break;
      }
      case Service.TRC20: {
          service = this.trc20Servcie
          return service
          break;
        }
      default: {
        throw new Error("Invalid request");
      }
    }
  }
}

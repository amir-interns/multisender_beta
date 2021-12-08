import { Injectable} from "@nestjs/common";
import { CronJob } from "cron";
import { SchedulerRegistry } from "@nestjs/schedule";
import { EthereumService } from 'src/blockchain/ethereum.service';
import { Cron } from '@nestjs/schedule';
import {getConnection, getRepository, Repository} from "typeorm";
import {RequestEntity} from "../entity/request.entity";
import {BlockchainEntity} from "../entity/blockchain.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {BlockchainRepository} from "../blockchain/customBlRep";
import {UsdtService} from "../blockchain/usdt.service";
import {TrxService} from "../blockchain/trx.service";
import {Trc20Service} from "../blockchain/trc20.service";
import {BitcoinService} from "../blockchain/bitcoin.service";

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
  getFee()
}

@Injectable()
export class QueueTask {
  private schedulerRegistry
  constructor(
    @InjectRepository(RequestEntity)
    private requestRepository: Repository<RequestEntity>,
    private btcService:BitcoinService,
    private ethService:EthereumService,
    private usdtService:UsdtService,
    private trxService:TrxService,
    private trc20Service:Trc20Service)
  {
    this.schedulerRegistry = new SchedulerRegistry()
  }


  @Cron('* * * * * *')
  async taskMonitoringNewTx() {
    try {
      const bdRecord = await getRepository(BlockchainEntity)
        .createQueryBuilder()
        .where({status: 'new'})
        .getOne();
      const service = this.getService(bdRecord.typeCoin)
      const account = await service.createNewAccount()
      let summaryCoins = BigInt(service.getFee())
      for (let i = 0; i < Object.keys(bdRecord.result).length; i++) {
        if (service.isAddress(bdRecord.result[i].to) !== true) {
          return `${bdRecord.result[i].to} is wrong address!`
        }
        summaryCoins += BigInt(bdRecord.result[i].value)
      }
        await this.requestRepository.save({
          status: 'new', idBlEnt: bdRecord.id, finalSum: summaryCoins.toString(),
          prKey: account.privateKey, address: account.address, date: new Date()
        })
        await getConnection()
          .createQueryBuilder()
          .update(BlockchainEntity)
          .set({status: 'request create', date: new Date()})
          .where({id: bdRecord.id})
          .execute();
    }
    catch {
      return 0
    }
  }
  @Cron('* * * * * *')
  async taskPayingSumCheck() {
    try {
      const queue = await getRepository(RequestEntity).find(({where: [{status: 'new'}]}))
      for (let i = 0; i <= queue.length; i++) {
        const baza = await getRepository(BlockchainEntity).findOne({where: [{id: queue[i].idBlEnt}]})
        const service = this.getService(baza.typeCoin)
        const balance = BigInt(await service.getBalance(queue[i].address))
        if (balance >= BigInt(queue[i].finalSum)) {
          const payedReq = await getConnection()
            .createQueryBuilder()
            .update(RequestEntity)
            .set({status: 'payed', date: new Date()})
            .where({id: queue[i].id})
            .execute();
          const payedBlAntity = await getRepository(BlockchainEntity).findOne({where: [{id: queue[i].idBlEnt}]})
          const hash = await service.sendTx(queue[i].address, queue[i].prKey, payedBlAntity.result)
          await getConnection()
            .createQueryBuilder()
            .update(BlockchainEntity)
            .set({status: 'submitted', txHash: hash, date: new Date()})
            .where({id: queue[i].idBlEnt})
            .execute();
        }
        if (Number(new Date()) - Number(queue[i].date) > 3600000 && queue[i].status === 'new') {
          await getConnection()
            .createQueryBuilder()
            .update(RequestEntity)
            .set({status: "expired", date: new Date()})
            .where({id: queue[i].id})
            .execute();
          await getConnection()
            .createQueryBuilder()
            .update(RequestEntity)
            .set({status: 'expired', date: new Date()})
            .where({id: queue[i].idBlEnt})
            .execute();
        }
      }
    }
    catch
      {
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
      default: {
        throw new Error("Invalid request");
      }
    }
  }
}


import {Inject, Injectable} from "@nestjs/common";
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
import BigNumber from "bignumber.js";

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
  getFee();
  getTokenBalance(address:string):any;
}

@Injectable()
export class QueueTask {
  constructor(
    @InjectRepository(RequestEntity)
    private requestRepository: Repository<RequestEntity>,
    private ethService: EthereumService,
    private usdtService: UsdtService,
  ) {
  }

  async createRequest(send, type) {
    const service = this.getService(type)
    let summaryCoins = new BigNumber(service.getFee())
    if (this.isToken(type)){
      summaryCoins = new BigNumber(0)
    }
    for (let i = 0; i < Object.keys(send).length; i++) {
      if (service.isAddress(send[i].to) !== true) {
        return `${send[i].to} is wrong address!`
      }
      summaryCoins = summaryCoins.plus(new BigNumber(send[i].value))
    }
    const account = await service.createNewAccount()
    if (this.isToken(type)){
      await this.requestRepository.save({
        status: 'new', finalSum: service.getFee().toString(),
        tokenCoins:summaryCoins.toString(), typeCoin: type, result: send,
        prKey: account.privateKey,
        address: account.address, date: new Date()
      })
    }
    else {
      await this.requestRepository.save({
        status: 'new', finalSum: summaryCoins.toString(),
        typeCoin: type, result: send, prKey: account.privateKey,
        address: account.address, date: new Date()
      })
    }
  }


  @Cron('* * * * * *')
  async taskPayingSumCheck() {
    try {
      const queue = await getRepository(RequestEntity).find(({where: [{status: 'new'}]}))
      for (let i = 0; i <= queue.length; i++) {
        const service = this.getService(queue[i].typeCoin)
        const balance = new BigNumber(await service.getBalance(queue[i].address))
        if (new BigNumber(queue[i].finalSum).isLessThanOrEqualTo(balance)) {
          if(this.isToken(queue[i].typeCoin)) {
            if (new BigNumber(queue[i].tokenCoins).isLessThanOrEqualTo(new BigNumber(await service.getTokenBalance(queue[i].address)))) {
              const payedReq = await getConnection()
                .createQueryBuilder()
                .update(RequestEntity)
                .set({status: 'payed', date: new Date()})
                .where({id: queue[i].id})
                .execute();
            }
          }
          else{
            const payedReq = await getConnection()
              .createQueryBuilder()
              .update(RequestEntity)
              .set({status: 'payed', date: new Date()})
              .where({id: queue[i].id})
              .execute();
          }
          if (Number(new Date()) - Number(queue[i].date) > 3600000 && queue[i].status === 'new') {
            await getConnection()
              .createQueryBuilder()
              .update(RequestEntity)
              .set({status: "expired", date: new Date()})
              .where({id: queue[i].id})
              .execute();
          }
        }
      }
    }
    catch {
      return 0
    }
  }

  getService(type) {
    let service: IBlockchainService
    switch (type) {
      case Service.Ethereum: {
        service = this.ethService
        return service
        break;
      }
      case Service.ERC20: {
        service = this.usdtService
        return service
        break;
      }
      default: {
        throw new Error("Invalid request");
      }
    }
  }

  isToken(type) {
    switch (type) {
      case Service.ERC20: {
        return true
        break;
      }
      // case Service.TRC20: {
      //   service = this.trc20Service
      //   return service
      //   break;
      // }
      default: {
        return false
      }
    }
  }
}


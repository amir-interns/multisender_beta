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
// import {IBlockchainService} from "src/blockchain/BlockchainService.interface"
// import {Service} from "src/blockchain/BlockchainService.interface"

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
  getTokenBalance(address:string):any;
}

@Injectable()
export class QueueTask {
  constructor(
    @InjectRepository(RequestEntity)
    private requestRepository: Repository<RequestEntity>,
    private ethService: EthereumService,
    private usdtService: UsdtService,
    private btcService: BitcoinService,
    private trxService: TrxService,
    private trc20Servcie:Trc20Service
  ) {
  }
  async createRequest(send, type:string) {
    console.log(await this.btcService.checkTx('93eafa10a57b1fbd8bda82c8cce75fb6ef66168437a6a7fc059daf077b48b33d'))
    // console.log(await this.btcService.send([
    //   {
    //     "to": "mhrDbpvnerMnENKu5X6Ci699ni76QC5Gsw",
    //     "value": 0.000712
    //   }
    // ]))

    // console.log(await this.btcService.sendTx("mmUrW3pJuoNQPNUG2fZADPZETBv6dYbqpa","308767172b55fc30330f5436034cb7a5ef2f737c42d9b426c7acf1bd74150f85",
    //   [
    //     {
    //       "to": "2NDoCrktYQsmtx9tRdf2mWK3jwCA97fzGb9",
    //       "value": 0.00001
    //     },
    //     {
    //       "to": "2MtEn3F1zDGdaykYKXzk5zJNfVRQDwJMYpu",
    //       "value": 0.00001
    //     }
    //   ]))
    const service = this.getService(type)
    let summaryCoins
    if (type === 'btc'){
      summaryCoins = new BigNumber(await service.getFee(send))
    }
    else{
      summaryCoins = new BigNumber(await service.getFee())
    }
    if (this.isToken(type)){
      summaryCoins = new BigNumber(0)
    }
    for (let i = 0; i < Object.keys(send).length; i++) {
      if (await service.isAddress(send[i].to) !== true) {
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

  isToken(type) {
    switch (type) {
      case Service.ERC20: {
        return true
        break;
      }
      case Service.TRC20: {
        return true
        break;
      }
      default: {
        return false
      }
    }
  }
}


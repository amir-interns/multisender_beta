import {Injectable} from "@nestjs/common";
import { EthereumService } from 'src/blockchain/ethereum.service';
import {Cron, CronExpression} from '@nestjs/schedule';
import { getConnection, getRepository, Repository} from "typeorm";
import {RequestEntity} from "src/entities/request.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {UsdtService} from "src/blockchain/usdt.service";
import {TrxService} from "src/blockchain/trx.service";
import {Trc20Service} from "src/blockchain/trc20.service";
import {BitcoinService} from "src/blockchain/bitcoin.service";
import BigNumber from "bignumber.js";
import {IBlockchainService} from "src/blockchain/blockchainService.interface"
import {Service} from "src/blockchain/blockchainService.interface"
import {BlockchainEntity} from "src/entities/blockchain.entity";

@Injectable()
export class RequestTask {
  constructor(
    @InjectRepository(RequestEntity)
    private requestRepository: Repository<RequestEntity>,
    @InjectRepository(BlockchainEntity)
    private blockchainRepository:Repository<BlockchainEntity>,
    private ethService: EthereumService,
    private usdtService: UsdtService,
    private btcService: BitcoinService,
    private trxService: TrxService,
    private trc20Servcie:Trc20Service,
  ) {
  }
  async createRequest(send, type:string) {
    const service = this.getService(type)
    let summaryCoins = new BigNumber(0)
    for (let i = 0; i < Object.keys(send).length; i++) {
      if (await service.isAddress(send[i].to) !== true) {
        throw new Error(`${send[i].to} is wrong address!`)
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
      return 1
    }
    await this.requestRepository.save({
      status: 'new', finalSum: (summaryCoins.plus(new BigNumber(await service.getFee(send)))).toString(),
      typeCoin: type, result: send, prKey: account.privateKey, tokenCoins:'0',
      address: account.address, date: new Date()
    })
  }
  @Cron(CronExpression.EVERY_10_SECONDS)
  async taskPayingSumCheck() {
    try {
      const queue = await getRepository(RequestEntity).find(({where: [{status: 'new'}]}))
      for (let i = 0; i <= queue.length; i++) {
        const service = this.getService(queue[i].typeCoin)
        const balance = new BigNumber(await service.getBalance(queue[i].address))
        if (new BigNumber(queue[i].finalSum).isLessThanOrEqualTo(balance) &&
          new BigNumber(queue[i].tokenCoins).isLessThanOrEqualTo(new BigNumber(await service.getTokenBalance(queue[i].address)))) {
          await getConnection()
            .createQueryBuilder()
            .update(RequestEntity)
            .set({status: 'payed', date: new Date(), result:queue[i].result, typeCoin:queue[i].typeCoin, id:queue[i].id})
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
    catch {
      return 0
    }
  }

  async deleteRequest(id){
    await this.requestRepository.delete({id})
  }
  getService(type) {
    let service: IBlockchainService
    switch (type) {
      case Service.Ethereum: {
        service = this.ethService
        return service
      }
      case Service.Bitcoin: {
        service = this.btcService
        return service
      }
      case Service.ERC20: {
        service = this.usdtService
        return service
      }
      case Service.Tron: {
        service = this.trxService
        return service
      }
      case Service.TRC20: {
        service = this.trc20Servcie
        return service
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
      }
      case Service.TRC20: {
        return true
      }
      default: {
        return false
      }
    }
  }
  async findAll(): Promise<RequestEntity[]> {
    const txs = await this.requestRepository.find()
    return txs
  }
}


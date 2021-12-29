import {Injectable, Logger} from "@nestjs/common";
import { EthereumService } from 'src/blockchain/ethereum.service';
import {Cron, CronExpression} from '@nestjs/schedule';
import {getConnection, getRepository, Repository} from "typeorm";
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
    private logger:Logger
  ) {
  }
  async createRequest(send, type:string) {
    this.logger.log(`createRequest`)
    const service = this.getService(type)
    let summaryCoins = new BigNumber(0)
    for (let i = 0; i < Object.keys(send).length; i++) {
      if (await service.isAddress(send[i].to) !== true) {
        throw new Error(`${send[i].to} is wrong address!`)
      }
      summaryCoins = summaryCoins.plus(new BigNumber(send[i].value))
    }
    const account = await service.createNewAccount()
    this.logger.log('Created new account')
    if (this.isToken(type)){
      this.logger.log('Before creating new request for sending tokens')
      await this.requestRepository.save({
        status: 'new', finalSum: service.getFee().toString(),
        tokenCoins:summaryCoins.toString(), typeCoin: type, result: send,
        prKey: account.privateKey,
        address: account.address, date: new Date()
      })
      this.logger.log('After creating new request for sending tokens')
      return { message: "Транзакция ожидает оплаты на странице \"Мои транзакции\"" }
    }
    this.logger.log('Before creating new request for sending cryptocurrency')
    await this.requestRepository.save({
      status: 'new', finalSum: (summaryCoins.plus(new BigNumber(await service.getFee(send)))).toString(),
      typeCoin: type, result: send, prKey: account.privateKey, tokenCoins:'0',
      address: account.address, date: new Date()
    })
    this.logger.log( 'After creating new request for sending cryptocurrency')
    return { message: "Транзакция ожидает оплаты на странице \"Мои транзакции\"" }
  }
  @Cron(CronExpression.EVERY_10_SECONDS)
  async taskPayingSumCheck() {
    this.logger.log(`taskPayingSumCheck`)
    try {
      this.logger.log('Before getting all new requests from DB')
      const queue = await getRepository(RequestEntity).find(({where: [{status: 'new'}]}))
      this.logger.log(`Found ${queue.length} new requests`)
      for (let i = 0; i <= queue.length; i++) {
        const service = this.getService(queue[i].typeCoin)
        this.logger.log(`Getting balance of ${queue[i].id} request`)
        const balance = new BigNumber(await service.getBalance(queue[i].address))
        this.logger.log(`Balance of ${queue[i].id} request is ${balance}`)
        if (new BigNumber(queue[i].finalSum).isLessThanOrEqualTo(balance) &&
          new BigNumber(queue[i].tokenCoins).isLessThanOrEqualTo(new BigNumber(await service.getTokenBalance(queue[i].address)))) {
          this.logger.log(`Balance of ${queue[i].id} request is enough, update status on payed`)
          await getConnection()
            .createQueryBuilder()
            .update(RequestEntity)
            .set({status: 'payed', date: new Date(), result:queue[i].result, typeCoin:queue[i].typeCoin, id:queue[i].id})
            .where({id: queue[i].id})
            .execute();
        }
        this.logger.log(`After updating ${queue[i].id} request status`)
        if (Number(new Date()) - Number(queue[i].date) > 3600000 && queue[i].status === 'new') {
          this.logger.log(`${queue[i].id} request is old enough, update status on expired`)
          await getConnection()
            .createQueryBuilder()
            .update(RequestEntity)
            .set({status: "expired", date: new Date()})
            .where({id: queue[i].id})
            .execute();
          this.logger.log(`After ${queue[i].id} request updating status on expired`)
        }
      }
    }
    catch(error) {
      this.logger.warn(`No any new requests or ${error}`)
    }
  }

  async deleteRequest(id){
    this.logger.log(`deleteRequest`)
    this.logger.log(`Before ${id} request deleting`)
    await this.requestRepository.delete({id})
    this.logger.log(`${id} request has been deleted`)
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
    this.logger.log(`Before finding all requests`)
    const txs = await this.requestRepository.find()
    this.logger.log(`Found ${txs.length} requests`)
    return txs
  }
}


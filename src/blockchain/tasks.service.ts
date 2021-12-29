import {Injectable, Logger} from "@nestjs/common";
import {Cron, CronExpression} from "@nestjs/schedule";
import {InjectRepository} from "@nestjs/typeorm";
import {BlockchainEntity} from "../entities/blockchain.entity";
import {getConnection, getRepository, Repository} from "typeorm";
import {EthereumService} from "./ethereum.service";
import {UsdtService} from "./usdt.service";
import {BitcoinService} from "./bitcoin.service";
import {TrxService} from "./trx.service";
import {Trc20Service} from "./trc20.service";
import {IBlockchainService} from "src/blockchain/blockchainService.interface"
import {Service} from "src/blockchain/blockchainService.interface"


@Injectable()
export class BlockchainTask {
  constructor(@InjectRepository(BlockchainEntity)
              private blockchainRepository:Repository<BlockchainEntity>,
              private ethService:EthereumService,
              private usdtService:UsdtService,
              private btcService:BitcoinService,
              private trxService: TrxService,
              private trc20Servcie:Trc20Service,
              private logger:Logger)
  { }
  @Cron(CronExpression.EVERY_10_SECONDS)
  async searchNewTransaction() {
    this.logger.log(`searchNewTransaction`)
    try {
      this.logger.log(`Before searching new transactions`)
      const payedTx = await this.blockchainRepository.findOne({where: {status: 'new'}})
      this.logger.log(`${payedTx.id} transaction in process`)
      const service = this.getService(payedTx.typeCoin)
      this.logger.log(`Before sending ${payedTx.id} transaction`)
      const hash = await service.sendTx(payedTx.Request.address, payedTx.Request.prKey, payedTx.Request.result)
      this.logger.log(`Transaction with hash ${hash} was submitted, updating Tx's status on submitted `)
      await this.blockchainRepository.update({id:payedTx.id},{
        typeCoin:payedTx.Request.typeCoin, status: 'submitted',
        result: payedTx.Request.result, date: new Date(),
        txHash: hash
      })
      this.logger.log(`After updating ${payedTx}`)
    }
    catch (error){
      this.logger.warn(`No any new transactions or ${error}`)
    }
  }
  @Cron(CronExpression.EVERY_10_SECONDS)
  async confirmateJob() {
    this.logger.log( `confirmateJob`)
    try {
      this.logger.log(`Before getting submitted transactions`)
      const bdRecord = await getRepository(BlockchainEntity)
        .createQueryBuilder()
        .where({status: 'submitted'})
        .getMany();
      this.logger.log(`Found ${bdRecord.length} submitted transactions`)
      for (let i=0; i <= bdRecord.length; i++) {
        const service = this.getService(bdRecord[i].typeCoin)
        if (await service.checkTx(bdRecord[i].txHash)) {
          this.logger.log(`${bdRecord[i].id} transaction confirmed, updating DB`)
          await getConnection()
            .createQueryBuilder()
            .update(BlockchainEntity)
            .set({status: 'confirmed'})
            .where({id: bdRecord[i].id})
            .execute();
          this.logger.log(`${bdRecord[i].id} record have been updated`)
        }
      }
    }
    catch (error){
      this.logger.warn(`No any submitted transactions or ${error}`)
    }
  }

  getService(type){
    let service:IBlockchainService
    switch(type) {
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
}


import {Controller, Param, Body, Inject, Post, UseGuards, } from '@nestjs/common'
import { BitcoinService } from 'src/blockchain/bitcoin.service'
import { EthereumService } from 'src/blockchain/ethereum.service'
import {UsdtService} from 'src/blockchain/usdt.service'
import {JwtAuthGuard} from "src/auth/jwt-auth.guard";
import { TrxService } from 'src/blockchain/trx.service'
import { Trc20Service } from 'src/blockchain/trc20.service'
import {QueueTask} from "../queue/queue.task";
import {Cron} from "@nestjs/schedule";
import {InjectRepository} from "@nestjs/typeorm";
import {BlockchainEntity} from "../entity/blockchain.entity";
import {Repository} from "typeorm";

interface IBlockchainService {
  sendTx(address:string, key:string, send: object): any;
  getBalance(address: string): object;
}

interface IBlockchainTask{
  sendTx(send:object, type:string):any;
  confirmateJob():any;
}

enum Service {
  Bitcoin = 'btc',
  Ethereum = 'eth',
  ERC20 = 'usdt',
  TRC20 = 'trc20',
  Tron = 'trx'
}

@Controller('blockchain')
export class BlockchainController {
  constructor(
    // private bitcoinService: BitcoinService,
              private ethereumService: EthereumService,
              // private usdtService: UsdtService,
              // private trxService: TrxService,
              // private trc20Service: Trc20Service,
              // @Inject('btc') private btcTask,
              @Inject('eth') private ethTask,
              // @Inject('usdt') private usdtTask,
              // @Inject('trx') private trxTask,
              // @Inject('trc20') private trc20Task,
    @InjectRepository(BlockchainEntity)
    private blockchainRepository:Repository<BlockchainEntity>
  ) {}
  @UseGuards(JwtAuthGuard)
  @Post('balance/:type/:address')
  async getBlockchainBalance(@Param('type') type, @Param('address') address): Promise<any> {
    let service: IBlockchainService
    switch(type) {
      case Service.Ethereum: {
        service = this.ethereumService
        break;
      }
      // case Service.Bitcoin: {
      //   service = this.bitcoinService
      //   break;
      // }
      // case Service.ERC20: {
      //   service = this.usdtService
      //   break;
      // }
      // case Service.TRC20: {
      //   service = this.trc20Service
      //   break;
      // }
      // case Service.Tron: {
      //   service = this.trxService
      //   break;
      // }
      default: {
        throw new Error("Invalid request");
      }
    }
    return await service.getBalance(address)
  }
  @UseGuards(JwtAuthGuard)
  @Post('sendTx')
  async sendBlockchainTx(@Body() params: any):Promise<any>{
    let task: IBlockchainTask
    switch(params.type) {
      case Service.Ethereum: {
        task = this.ethTask
        break;
      }
      // case Service.Bitcoin: {
      //   task = this.btcTask
      //   break;
      // }
      // case Service.ERC20: {
      //   task = this.usdtTask
      //   break;
      // }
      // case Service.TRC20: {
      //   task = this.trc20Task
      //   break;
      // }
      // case Service.Tron: {
      //   task = this.trxTask
      //   break;
      // }
      default: {
        throw new Error("Invalid request");
      }
    }
    return task.sendTx(params.send, params.type)
  }
}


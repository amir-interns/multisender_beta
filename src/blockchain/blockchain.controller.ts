import {Controller, Req, Get, Param, Body, forwardRef, Inject, Post, UseGuards, Query} from '@nestjs/common'
import { BitcoinService } from './bitcoin.service'
import { EthereumService } from './ethereum.service'
import {UsdtService} from './usdt.service'
import {JwtAuthGuard} from "src/auth/jwt-auth.guard";
import {BlockchainTask} from "./tasks.service";
import { TrxService } from './trx.service'
import { Trc20Service } from './trc20.service'

interface IBlockchainService {
  sendTx(body: object): object;
  getBalance(address: string): object;
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
    constructor(private bitcoinService: BitcoinService,
                private ethereumService: EthereumService,
                private usdtService: UsdtService,
                private trxService: TrxService,
                private trc20Service: Trc20Service
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
        case Service.Bitcoin: {
          service = this.bitcoinService
          break;
        }
        case Service.ERC20: {
          service = this.usdtService
          break;
        }
        case Service.TRC20: {
          service = this.trc20Service
          break;
        }
        case Service.Tron: {
          service = this.trxService
          break;
        }
        default: {
          throw new Error("Invalid request");
        }
      }
      return await service.getBalance(address)
    }
    @UseGuards(JwtAuthGuard)
    @Post('sendTx')
    async sendBlockchainTx(@Body() params: any):Promise<void>{
      let serviceType: IBlockchainService
      switch(params.type) {
        case Service.Ethereum: {
          serviceType = this.ethereumService
          break;
        }
        case Service.Bitcoin: {
          serviceType = this.bitcoinService
          break;
        }
        case Service.ERC20: {
          serviceType = this.usdtService
          break;
        }
        case Service.TRC20: {
          serviceType = this.trc20Service
          break;
        }
        case Service.Tron: {
          serviceType = this.trxService
          break;
        }
        default: {
          throw new Error("Invalid request");
        }
      }

      const task = new BlockchainTask(serviceType)
      return task.sendTx(params.send)
    }

}

import {Controller, Req, Get, Param, Body, forwardRef, Inject, Post, UseGuards, Query} from '@nestjs/common'
import { BitcoinService } from 'src/blockchain/bitcoin.service'
import { EthereumService } from 'src/blockchain/ethereum.service'
import {UsdtService} from 'src/blockchain/usdt.service'
import {JwtAuthGuard} from "src/auth/jwt-auth.guard";
import {BlockchainTask} from "src/blockchain/tasks.service";
import { TrxService } from './trx.service'
import { Trc20Service } from './trc20.service'

interface IBlockchainService {
  sendTx(body: object): object;
  getBalance(address: string): object;
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
      const service: IBlockchainService = type === 'eth' ? this.ethereumService : (type === 'btc' ? this.bitcoinService : (type === 'usdt' ? this.usdtService : ( type === 'trx' ? this.trxService : this.trc20Service)))
      return await service.getBalance(address)
    }
    @UseGuards(JwtAuthGuard)
    @Post('sendTx')
    async sendBlockchainTx(@Body() params: any):Promise<void>{
      const serviceType = params.type === 'eth' ? this.ethereumService : (params.type === 'btc' ? this.bitcoinService : (params.type === 'usdt' ? this.usdtService : ( params.type === 'trx' ? this.trxService : this.trc20Service)))
      const task = new BlockchainTask(serviceType)
      return task.sendTx(params.send)
    }

}

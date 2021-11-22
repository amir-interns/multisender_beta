import {Controller, Req, Get, Param, Body, forwardRef, Inject, Post, UseGuards, Query} from '@nestjs/common'
import { BitcoinService } from 'src/blockchain/bitcoin.service'
import { EthereumService } from 'src/blockchain/ethereum.service'
import {UsdtService} from 'src/blockchain/usdt.service'
import {JwtAuthGuard} from "src/auth/jwt-auth.guard";
import {BlockchainTask} from "src/blockchain/tasks.service";


@Controller('blockchain')
export class BlockchainController {
    constructor(private bitcoinService: BitcoinService,
                private ethereumService: EthereumService,
                private usdtService: UsdtService,
                ) {}
    @UseGuards(JwtAuthGuard)
    @Post('balance/:type/:address')
    async getBlockchainBalance(@Param('type') type, @Param('address') address): Promise<any> {
      const service = type === 'eth' ? this.ethereumService : (type === 'btc' ? this.bitcoinService : this.usdtService)
      return await service.getBalance(address)
    }
    @UseGuards(JwtAuthGuard)
    @Post('sendTx')
    async sendBlockchainTx(@Body() params: any):Promise<void>{
      const serviceType = params.type === 'eth' ? this.ethereumService : (params.type === 'btc' ? this.bitcoinService : this.usdtService)
      const task = new BlockchainTask(serviceType)
      return task.sendTx(params.send)
    }

}

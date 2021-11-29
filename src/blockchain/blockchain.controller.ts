import {Controller, Param, Body, Inject, Post, UseGuards, Injectable} from '@nestjs/common'
import { BitcoinService } from 'src/blockchain/bitcoin.service'
import { EthereumService } from 'src/blockchain/ethereum.service'
import {UsdtService} from 'src/blockchain/usdt.service'
import {JwtAuthGuard} from "src/auth/jwt-auth.guard";

@Injectable()
@Controller('blockchain')
export class BlockchainController {
    constructor(private bitcoinService: BitcoinService,
                private ethereumService: EthereumService,
                private usdtService: UsdtService,
                @Inject('btc') private btcTask,
                @Inject('eth') private ethTask,
                @Inject('usdt') private usdtTask,
                ) {}
    @UseGuards(JwtAuthGuard)
    @Post('balance/:type/:address')
    async getBlockchainBalance(@Param('type') type, @Param('address') address): Promise<any> {
      const service = type === 'eth' ? this.ethereumService :
        (type === 'btc' ? this.bitcoinService : this.usdtService)
      return await service.getBalance(address)
    }

    @UseGuards(JwtAuthGuard)
    @Post('sendTx')
    async sendBlockchainTx(@Body() params: any):Promise<any>{
      const serviceTask = params.type === 'eth' ? this.ethTask :
        (params.type === 'btc' ? this.btcTask : this.usdtTask)
      return serviceTask.sendTx(params.send)
    }
}

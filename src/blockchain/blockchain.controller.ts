import { Controller, Get, Param, Body, forwardRef, Inject, Post,UseGuards } from '@nestjs/common'
import { BitcoinService } from './bitcoin.service'
import { BlockchainService } from './blockchain.service'
import { EthereumService } from './EthereumService'
import {UsdtService} from './usdt.service'
import {AuthService} from "../auth/auth.service";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import { AuthGuard } from '@nestjs/passport';

interface IBlockchainService {
    sendTx(body: object): object
}

@Controller('blockchain')
export class BlockchainController {
    constructor(private bitcoinService: BitcoinService,
                private etheriumService: EthereumService,
                private blockChainService: BlockchainService,
                private usdtService: UsdtService,
                private authService:AuthService)
                 {}


    @UseGuards(AuthGuard('local'))
    @Post('auth')
    async login(@Body() req) {
      return this.authService.login(req)
    }

    @Post('balance/:type/:address')
    async getBlockchainBalance(@Param() params: any): Promise<object> {
       const service: IBlockchainService = params.type === 'eth' ? this.etheriumService : this.bitcoinService
       return service.getBalance(params.address)
    }


    @UseGuards(JwtAuthGuard)
    @Post('sendTx')
    async sendBlockchainTx(@Body() params: any): Promise<object>{
        const service: IBlockchainService = params.type === 'eth' ? this.etheriumService : (params.type === 'btc' ? this.bitcoinService : this.usdtService)
        return service.sendTx(params.send)
    }

}

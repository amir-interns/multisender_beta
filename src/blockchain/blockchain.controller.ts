import {Controller, Req, Get, Param, Body, forwardRef, Inject, Post, UseGuards, Query} from '@nestjs/common'
import { BitcoinService } from './bitcoin.service'
import {Request } from 'express'
import { EthereumService } from './ethereum.service'
import {UsdtService} from './usdt.service'
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {TasksEthService} from "./tasks/tasksEth.service";


interface IBlockchainService {
    sendTx(body: object): object;
    getBalance(address: string): object;
}



@Controller('blockchain')
export class BlockchainController {
    constructor(private bitcoinService: BitcoinService,
                private etheriumTask: TasksEthService,
                private etheriumService: EthereumService,
                private usdtService: UsdtService
                )
                 {}


    @UseGuards(JwtAuthGuard)
    @Post('balance/:type/:address')
    async getBlockchainBalance(@Param('type') type, @Param('address') address): Promise<any> {
       const service: IBlockchainService = type === 'eth' ? this.etheriumService : (type === 'btc' ? this.bitcoinService : this.usdtService)
       return await service.getBalance(address)
    }




    @UseGuards(JwtAuthGuard)
    @Post('sendTx')
    async sendBlockchainTx(@Body() params: any):Promise<void>{
        // const service = params.type === ('eth' || 'usdt') ? this.etheriumTask : this.bitcoinService
      const service=this.etheriumTask
        return service.send(params.send, params.type)
    }

}

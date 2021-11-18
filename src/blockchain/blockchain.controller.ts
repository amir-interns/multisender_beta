import {Controller, Req, Get, Param, Body, forwardRef, Inject, Post, UseGuards, Query} from '@nestjs/common'
import { BitcoinService } from './bitcoin.service'
import {Request } from 'express'
import { EthereumService } from './ethereum.service'
import {UsdtService} from './usdt.service'
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {TasksEthService} from "./tasks/tasksEth.service";


interface IBlockchainService {
    sendTx(body: object): object;
    getBalance(address: string): object; //Type  вместо адреса
}



@Controller('blockchain')
export class BlockchainController {
    constructor(private bitcoinService: BitcoinService,
                private ethereumTask: TasksEthService,
                private ethereumService: EthereumService,
                private usdtService: UsdtService
                )
                 {}


    @UseGuards(JwtAuthGuard)
    @Post('balance/:type/:address')
    async getBlockchainBalance(@Param('type') type, @Param('address') address): Promise<any> {
       // const service: IBlockchainService = type === 'eth' ? this.ethereumService : (type === 'btc' ? this.bitcoinService : this.usdtService)
      const service =this.ethereumTask
      return await service.getBalance(type)
    }




    @UseGuards(JwtAuthGuard)
    @Post('sendTx')
    async sendBlockchainTx(@Body() params: any):Promise<void>{
      // const service = params.type === ('eth' || 'usdt') ? this.etheriumTask : this.bitcoinService
      const service =this.ethereumTask
      return service.send(params.send, params.type)
    }

}

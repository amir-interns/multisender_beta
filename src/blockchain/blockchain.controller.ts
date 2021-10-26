import { Controller, Get, Param, Body, forwardRef, Inject, Post } from '@nestjs/common'
import { BitcoinService } from './bitcoin.service'
import { BlockchainService } from './blockchain.service'
import { EtheriumService } from './ethereum.service'
import {UsdtService} from './usdt.service'



interface IBlockchainService {
    //sayHello(): string
    //getBalance(address: string): Promise<object>
    sendTx(body: object): object
    //checkTx(txHash: string): Promise<object>
}

@Controller('blockchain')
export class BlockchainController {
    constructor(private bitcoinService: BitcoinService,
                private etheriumService: EtheriumService,
                private blockChainService: BlockchainService,
                private usdtService: UsdtService
                ) {}

    


    //@Post('test/:type')
    //testF(@Param() params: any): string {
    //    const service: IBlockchainService = params.type === 'eth' ? this.etheriumService : this.bitcoinService
    //    return service.sayHello()
    //}

    //@Post('balance/:type/:address')
    //getBlockchainBalance(@Param() params: any): Promise<object> {
    //    const service: IBlockchainService = params.type === 'eth' ? this.etheriumService : this.bitcoinService
    //    return service.getBalance(params.address)
    //}



    @Post('sendTx')
    async sendBlockchainTx(@Body() params: any): Promise<object>{
        const service: IBlockchainService = params.type === 'eth' ? this.etheriumService : (params.type === 'btc' ? this.bitcoinService : this.usdtService)
        return service.sendTx(params.send)
    }

    //@Post('checkTx/:type/:hash')
    //async checkBlockchainTx(@Param() params: any): Promise<object>{
    //    const service: IBlockchainService = params.type === 'eth' ? this.etheriumService : this.bitcoinService
    //    return service.checkTx(params.hash)
    //}

    //@Get('findAll')
    //findAll() {
    //    return this.bitcoinService.findAll()
    //}

}

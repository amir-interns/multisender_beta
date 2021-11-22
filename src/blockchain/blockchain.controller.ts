import {Controller, Req, Get, Param, Body, forwardRef, Inject, Post, UseGuards, Query} from '@nestjs/common'
import { BitcoinService } from './bitcoin.service'
import {Request } from 'express'
import { EthereumService } from './ethereum.service'
import {UsdtService} from './usdt.service'
import {AuthService} from "../auth/auth.service";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { SendTxDto } from './dto/SendTx-dto'
import { TrxService } from './trx.service'
import { Trc20Service } from './trc20.service'

interface IBlockchainService {
    sendTx(body: object): object;
    getBalance(address: string): object;
}


@ApiTags('Blochchain методы')
@Controller('blockchain')
export class BlockchainController {
    constructor(private bitcoinService: BitcoinService,
                private etheriumService: EthereumService,
                private usdtService: UsdtService,
                private trxService: TrxService,
                private trc20Service: Trc20Service)
                 {}

    @ApiOperation({summary: 'Возвращает баланс кошелька address в сети типа type'})
    @ApiResponse({status: 200, description: 'В пути запроса явно указать тип и адрес' })
    //@UseGuards(JwtAuthGuard)
    @Post('balance/:type/:address')
    async getBlockchainBalance(@Param('type') type, @Param('address') address): Promise<any> {
       const service: IBlockchainService = type === 'eth' ? this.etheriumService : (type === 'btc' ? this.bitcoinService : (type === 'usdt' ? this.usdtService : ( type === 'trx' ? this.trxService : this.trc20Service)))
       return await service.getBalance(address)
    }



    @ApiOperation({summary: 'Отправляет транзакцию в соответствии с указанными адресами и значениями сумм в выбранной сети'})
    @ApiResponse({status: 200, description: 'Необходимо передать методом POST в теле запроса строку вида: { type: btc || eth || usdt, send: [{to: trhrth, value: 0.001}, ... ] }', type: SendTxDto })
    //@UseGuards(JwtAuthGuard)
    @Post('sendTx')
    async sendBlockchainTx(@Body() params: any): Promise<object>{
        const service: IBlockchainService = params.type === 'eth' ? this.etheriumService : (params.type === 'btc' ? this.bitcoinService : (params.type === 'usdt' ? this.usdtService : ( params.type === 'trx' ? this.trxService : this.trc20Service)))
        return service.sendTx(params.send)
    }


}

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
const TronWeb = require('tronweb');
const abi = require('../../config/trc20Abi.json')
const abiT = require('../../config/piaTokenAbi.json')

@Injectable()
export class Trc20Service {
    public fullNode
    public solidityNode
    public eventServer
    public privateKey
    public tronWeb
    public sourceAddress
    public contractAddress
    public TcontractAddress

    constructor(private configService: ConfigService) {
        this.fullNode = configService.get<string>('Trc20Config.fullNode')
        this.solidityNode = configService.get<string>('Trc20Config.solidityNode')
        this.eventServer = configService.get<string>('Trc20Config.eventServer')
        this.privateKey = configService.get<string>('Trc20Config.privateKey')
        this.tronWeb = new TronWeb(this.fullNode, this.solidityNode, this.eventServer, this.privateKey)
        this.sourceAddress = configService.get<string>('Trc20Config.TrxSourceAddress')
        this.contractAddress = configService.get<string>('Trc20Config.contractAddress')
        this.TcontractAddress = configService.get<string>('Trc20Config.TcontractAddress')
    }


    getBalance(address) {
        return address
    }

    async sendTx(body) {
        //Send Trx
        let amounts=[]
        let receivers=[]
        let summaryCoins=0
        for (let i = 0; i < Object.keys(body).length; i++) {
            summaryCoins+=body[i].value
            receivers.push(body[i].to)
            amounts.push(body[i].value)
        }
        
        let contractT = await this.tronWeb.contract(abiT, this.TcontractAddress); //piaToken

        contractT.approve(this.contractAddress, summaryCoins).send({
            feeLimit:100_000_000,
            shouldPollResponse:true
        });

        let contract = await this.tronWeb.contract(abi, this.contractAddress); 

        let result = await contract.send(this.TcontractAddress, receivers,amounts).send({
            feeLimit:100_000_000,
            shouldPollResponse:true
        });

        return result
    }
}
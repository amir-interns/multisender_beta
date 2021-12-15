import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
const TronWeb = require('tronweb');
import {getConnection, Repository} from 'typeorm'
import {BlockchainEntity} from "src/entity/blockchain.entity"
import { InjectRepository } from '@nestjs/typeorm'
const TronGrid = require('trongrid')



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
    public tronGrid

    constructor(@InjectRepository(BlockchainEntity)
                private blockchainRepository:Repository<BlockchainEntity>,
                private configService: ConfigService) {
        this.fullNode = configService.get<string>('Trc20Config.fullNode')
        this.solidityNode = configService.get<string>('Trc20Config.solidityNode')
        this.eventServer = configService.get<string>('Trc20Config.eventServer')
        this.privateKey = configService.get<string>('Trc20Config.privateKey')
        this.tronWeb = new TronWeb(this.fullNode, this.solidityNode, this.eventServer, this.privateKey)
        this.sourceAddress = configService.get<string>('Trc20Config.TrxSourceAddress')
        this.contractAddress = configService.get<string>('Trc20Config.contractAddress')
        this.TcontractAddress = configService.get<string>('Trc20Config.TcontractAddress')
        this.tronGrid = new TronGrid(this.tronWeb)
    }
   async getBalance(address){
     return this.tronWeb.trx.getBalance(address).then(result => {return result})
    }
    async getTokenBalance(address) {
        if (! await this.tronWeb.isAddress(address)){
            return `${address} is wrong address!`
        }
        const contract = await this.tronWeb.contract().at(this.TcontractAddress);
        const result = await contract.balanceOf(address).call()
        return parseFloat(result)
    }
    getFee(){
        return 20
    }
    isAddress(address:string){
        return this.tronWeb.isAddress(address)
    }
    async createNewAccount() {
      const account = await this.tronWeb.createAccount()
      account.address=account.address.base58
      return account
    }
    async sendTx(address,key, body) {
        let amounts=[]
        let receivers=[]
        let summaryCoins=0
        for (let i = 0; i < Object.keys(body).length; i++) {
            summaryCoins+=body[i].value * 1000000
            receivers.push(body[i].to)
            amounts.push(body[i].value * 1000000)
        }
        const tronweb2 = new TronWeb(this.fullNode, this.solidityNode, this.eventServer, key)
        const contractT = await tronweb2.contract().at(this.TcontractAddress);
        contractT.approve(this.contractAddress, summaryCoins).send({
            feeLimit:50_000_000,
            shouldPollResponse:true
        });
        const contract = await tronweb2.contract().at(this.contractAddress);
        const result = await contract.transferTokens(this.TcontractAddress, receivers,amounts).send({
            feeLimit:50_000_000,
            shouldPollResponse:false
        });
        return result
    }
    async checkTx(hash) {
        const options = {
            Show_assets: true,
            only_confirmed: true,
        }
        const res =await this.tronGrid.transaction.getEvents(hash, options)
        if (res.success) {
            return true
        }
    }
}
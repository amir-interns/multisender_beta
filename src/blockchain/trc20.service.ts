import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
const TronWeb = require('tronweb');
import {getConnection, Repository} from 'typeorm'
import {BlockchainEntity} from "src/entities/blockchain.entity"
import { InjectRepository } from '@nestjs/typeorm'
import {Account, Send} from "./blockchainService.interface";
import BigNumber from "bignumber.js";
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
   async getBalance(address:string):Promise<string>{
     if (!this.isAddress(address)){
       throw new Error(`${address} is wrong address!`)
     }
     const ten = new BigNumber(10)
     const balance = new BigNumber(await this.tronWeb.trx.getBalance(address))
     const bal = (balance.dividedBy(ten.exponentiatedBy(6))).toString()
     return bal
    }
   async getTokenBalance(address:string):Promise<string>{
     if (!this.isAddress(address)){
       throw new Error(`${address} is wrong address!`)
     }
     const ten = new BigNumber(10)
     const contract = await this.tronWeb.contract().at(this.TcontractAddress);
     const result = new BigNumber(String(await contract.balanceOf(address).call()))
     const bal = (result.dividedBy(ten.exponentiatedBy(6))).toString()
     return bal
   }
   getFee():number{
     return 40
   }
   isAddress(address:string):boolean{
     return this.tronWeb.isAddress(address)
   }
   async createNewAccount():Promise<Account> {
     const ac = await this.tronWeb.createAccount()
     let account: Account
     account = {address:ac.address.base58,privateKey:ac.privateKey.toString('hex')}
     return account
   }
   async sendTx(address:string,key:string, body:Array<Send>):Promise<string>{
     const amounts = []
     const receivers = []
     let summaryCoins = 0
     for (let i = 0; i < Object.keys(body).length; i++) {
       summaryCoins += body[i].value * 1000000
       receivers.push(body[i].to)
       amounts.push(body[i].value * 1000000)
     }
     const tronweb2 = new TronWeb(this.fullNode, this.solidityNode, this.eventServer, key)
     const contractT = await tronweb2.contract().at(this.TcontractAddress);
     contractT.approve(this.contractAddress, summaryCoins).send({
       feeLimit:20_000_000,
       shouldPollResponse:true
     });
     const contract = await tronweb2.contract().at(this.contractAddress);
     const result = await contract.transferTokens(this.TcontractAddress, receivers,amounts).send({
       feeLimit:20_000_000,
       shouldPollResponse:false
     });
     return result
   }
   async checkTx(hash:string):Promise<boolean>  {
     const options = {
       Show_assets: true,
       only_confirmed: true,
     }
     const res = await this.tronGrid.transaction.getEvents(hash, options)
     if (res.success) {
       return true
     }
   }
}
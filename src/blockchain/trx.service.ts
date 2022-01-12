import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {Account, Send} from "./blockchainService.interface";
const TronWeb = require('tronweb');
const TronGrid = require('trongrid')
import BigNumber from "bignumber.js";

@Injectable()
export class TrxService {
    public fullNode
    public solidityNode
    public eventServer
    public privateKey
    public tronWeb
    public sourceAddress
    public contractAddress
    public tronGrid

    constructor(private configService: ConfigService) {
        this.fullNode = configService.get<string>('TrxConfig.fullNode')
        this.solidityNode = configService.get<string>('TrxConfig.solidityNode')
        this.eventServer = configService.get<string>('TrxConfig.eventServer')
        this.privateKey = configService.get<string>('TrxConfig.privateKey')
        this.tronWeb = new TronWeb(this.fullNode, this.solidityNode, this.eventServer, this.privateKey)
        this.sourceAddress = configService.get<string>('TrxConfig.TrxSourceAddress')
        this.contractAddress = configService.get<string>('TrxConfig.contractAddress')
        this.tronGrid = new TronGrid(this.tronWeb)
    }


    async getBalance(address:string):Promise<string> {
      if (!this.isAddress(address)){
        throw new Error(`${address} is wrong address!`)
      }
      return this.tronWeb.trx.getBalance(address).then(result => {return result})
    }
   async getTokenBalance(address:string):Promise<string>{
      return '0'
   }
    getFee():number{
      return 30
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

    async sendTx(address:string,key:string, send:Array<Send>):Promise<string>{
      const receivers = []
      const amounts = []
      let finalSum = 0
      for (let i = 0; i < send.length; i++) {
        receivers.push(send[i].to)
        amounts.push(send[i].value * 1000000)
        finalSum += (send[i].value * 1000000)
      }
      this.tronWeb = new TronWeb(this.fullNode, this.solidityNode, this.eventServer, key)
      const contract = await this.tronWeb.contract().at(this.contractAddress);
      const result = await contract.send(receivers,amounts).send({
        feeLimit:30_000_000,
        callValue:finalSum,
        shouldPollResponse:false
      });
      return result
    }
    async checkTx(hash:string):Promise<boolean>{
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
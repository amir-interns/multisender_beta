import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
const TronWeb = require('tronweb');
import {BlockchainEntity} from "src/entity/blockchain.entity"
import { InjectRepository } from '@nestjs/typeorm'
const TronGrid = require('trongrid')
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


    async getBalance(address) {
        return this.tronWeb.trx.getBalance(address).then(result => {return result})
    }
   async getTokenBalance(address){
        return 0
   }

    getFee(){
        return 0
    }

    isAddress(address:string){
        return this.tronWeb.isAddress(address)
    }
    async createNewAccount() {
        const account = await this.tronWeb.createAccount()
        account.address=account.address.base58
        return account
    }

    async sendTx(address,key, send){
        const receivers = []
        const amounts = []
        let finalSum = 0
        for (let i = 0; i < send.length; i++) {
            receivers.push(send[i].to)
            amounts.push(send[i].value)
            finalSum += send[i].value
        }
        this.tronWeb = new TronWeb(this.fullNode, this.solidityNode, this.eventServer, key)
        const contract = await this.tronWeb.contract().at(this.contractAddress);
        const result = await contract.send(receivers,amounts).send({
            feeLimit:100_000_000,
            callValue:finalSum,
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
            // await this.bdService.updateStatusSubmitBlockchainRecord(hash)
            return true
        }
    }
}
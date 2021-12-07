import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
const TronWeb = require('tronweb');
import {BlockchainEntity} from "src/entity/blockchain.entity"
import { InjectRepository } from '@nestjs/typeorm'
import {BdService} from "../queue/bd.service";
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

    constructor(@InjectRepository(BlockchainEntity)
                private bdService:BdService,
                private configService: ConfigService) {
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

    async sendTx(body) {
        // Check max Txs
        let outputCount = 0;
        for (let i of body) {
            outputCount++;
        }
        ;
        if (outputCount > 50) {
            throw new Error("Too much transactions. Max 50.");
        }
        // Check balance
        let trxToSend = 0;
        for (let i of body) {
            trxToSend = trxToSend + parseFloat(i.value);
        }
        ;
        const totalTrxAvailable = this.getBalance(this.sourceAddress)
        if (Number(totalTrxAvailable) - trxToSend < 0) {
            throw new Error("Balance is too low for this transaction");
        }
        // Send Trx
        let amounts = []
        let receivers = []
        let summaryCoins = 0
        for (let i = 0; i < Object.keys(body).length; i++) {
            summaryCoins += body[i].value
            receivers.push(body[i].to)
            amounts.push(body[i].value)
        }
        const bdRecord = await this.bdService.createNewBlockchainRecord(body,'trx')
        await this.bdService.createNewRequestRecord(await this.tronWeb.trx.accounts.create(), bdRecord, trxToSend)
    }

    async sendSubmitTX(idd){
        const queryTx = await this.bdService.getOneBlockchainRecord(idd)
        const queryQue = await this.bdService.getOneRequestRecord(idd)
        const receivers = []
        const amounts = []
        for (let i = 0; i < Object.keys(queryTx.result).length; i++) {
            receivers.push(queryTx.result[i].to)
            amounts.push(queryTx.result[i].value)
        }
        const contract = await this.tronWeb.contract().at(this.contractAddress);
        const result = await contract.send(receivers,amounts).send({
            feeLimit:100_000_000,
            callValue:queryQue.finalSum,
            shouldPollResponse:false
        });
        await this.bdService.updateStatusBlockchainRecord(idd,result)
        return result

    }

    async checkTx(hash) {
        const options = {
            Show_assets: true,
            only_confirmed: true,
        }
        const res =await this.tronGrid.transaction.getEvents(hash, options)
        if (res.success) {
            await this.bdService.updateStatusSubmitBlockchainRecord(hash)
            return true
        }
    }
}
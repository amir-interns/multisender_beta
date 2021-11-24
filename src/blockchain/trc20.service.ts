import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
const TronWeb = require('tronweb');
import {getConnection, Repository} from 'typeorm'
import {BlockchainEntity} from "src/entity/blockchain.entity"
import { InjectRepository } from '@nestjs/typeorm'



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
    }


    async getBalance(address) {
        let contract = await this.tronWeb.contract().at(this.TcontractAddress); 

        let result = await contract.balanceOf(address).call()
        return result
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
        const blockchainEntity = new BlockchainEntity()
        blockchainEntity.date = new Date()
        blockchainEntity.status = 'new'
        blockchainEntity.typeCoin = 'trc20'
        blockchainEntity.result = body
        const bdRecord = await this.blockchainRepository.save(blockchainEntity)
    
        let contractT = await this.tronWeb.contract().at(this.TcontractAddress);
        contractT.approve(this.contractAddress, summaryCoins).send({
            feeLimit:100_000_000,
            shouldPollResponse:true
        });
        
        let contract = await this.tronWeb.contract().at(this.contractAddress); 

        let result = await contract.transferTokens(this.TcontractAddress, receivers,amounts).send({
            feeLimit:100_000_000,
            shouldPollResponse:false
        });
        await getConnection()
            .createQueryBuilder()
            .update(BlockchainEntity)
            .set({ status:'submitted', txHash:result, result:body, date:new Date()})
            .where({id:bdRecord.id})
            .execute();
        return result
    }

    async checkTx(hash) {
        const txId = await this.tronWeb.trx.getTransactionInfo(hash)
        const currentBlock = await this.tronWeb.trx.getCurrentBlock()

        if (( currentBlock.block_header.raw_data.number - txId.txID ) >= 3) {
          await getConnection()
            .createQueryBuilder()
            .update(BlockchainEntity)
            .set({status: 'confirmed', date: new Date()})
            .where({txHash: hash})
            .execute();
          return true
        }
      }
}
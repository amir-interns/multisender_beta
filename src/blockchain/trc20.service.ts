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


    async getBalance(address) {
        const contract = await this.tronWeb.contract().at(this.TcontractAddress);

        const result = await contract.balanceOf(address).call()
        return result
    }

    async sendTx(body) {
        // Send Trx
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

        const contractT = await this.tronWeb.contract().at(this.TcontractAddress);
        contractT.approve(this.contractAddress, summaryCoins).send({
            feeLimit:100_000_000,
            shouldPollResponse:true
        });

        const contract = await this.tronWeb.contract().at(this.contractAddress);

        const result = await contract.transferTokens(this.TcontractAddress, receivers,amounts).send({
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
        const options = {
            Show_assets: true,
            only_confirmed: true,
        }
        const res =await this.tronGrid.transaction.getEvents(hash, options)
        if (res.success) {
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
import { Injectable } from '@nestjs/common'
import {BlockchainEntity} from "../entity/blockchain.entity"
import {getConnection, Repository} from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
const Web3 = require ('web3')
import {ConfigService} from '@nestjs/config'
const Contract = require ('web3-eth-contract')
const abi = require ('../../config/abiEth')
const BigNumber = require('bignumber.js')


@Injectable()
export class EthereumService {
  private gasPrice
  private gasLimit
  private chainId
  private privateKey
  private addrSender
  private web3
  private ethContract
  private ws

  constructor(
    @InjectRepository(BlockchainEntity)
    private blockchainRepository:Repository<BlockchainEntity>,
    private ethconfig:ConfigService,
  ) {
    this.gasPrice = ethconfig.get<number>('EthereumConfig.gasPrice')
    this.gasLimit = ethconfig.get<number>('EthereumConfig.gasLimit')
    this.addrSender = ethconfig.get<string>('EthereumConfig.addrSender')
    this.chainId = ethconfig.get<number>('EthereumConfig.chainId')
    this.privateKey = ethconfig.get<string>('EthereumConfig.privateKey')
    this.ethContract = ethconfig.get<string>('EthereumConfig.ethContract')
    this.ws = ethconfig.get<string>('TokenConfig.tokenWebSocketInfura')
    this.web3 = new Web3(this.ws)
  }

  async getBalance(address:string){
    if (! this.web3.utils.isAddress(address)){
      return `${address} is wrong address!`
    }
    return parseInt(await this.web3.eth.getBalance(this.addrSender), 10)
  }

  async sendTx(send: object): Promise<any> {
    const amounts = []
    const receivers = []
    let summaryCoins = BigNumber(0)
    let sum = 0
    for (let i = 0; i < Object.keys(send).length; i++) {
      if (this.web3.utils.isAddress(send[i].to) !== true) {
        return `${send[i].to} is wrong address!`
      }
      summaryCoins = BigNumber.sum(summaryCoins, send[i].value)
      receivers.push(send[i].to)
      amounts.push(send[i].value)

    }
    const blockchainEntity = new BlockchainEntity()
    blockchainEntity.date = new Date()
    blockchainEntity.status = 'new'
    blockchainEntity.typeCoin = 'eth'
    blockchainEntity.result = send
    const bdRecord = await this.blockchainRepository.save(blockchainEntity)
    const contract =  new Contract(abi, this.ethContract)
    const rawTx = {
      gasPrice: this.gasPrice,
      gasLimit: this.gasLimit,
      to: this.ethContract,
      from: this.addrSender,
      value: summaryCoins,
      chainId: this.chainId,
      data: await contract.methods.send(receivers, amounts).encodeABI()
    }

    const signedTx=await this.web3.eth.accounts.signTransaction(rawTx, this.privateKey)
    const result=await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction)
    await getConnection()
      .createQueryBuilder()
      .update(BlockchainEntity)
      .set({ status:'submitted', txHash:result.transactionHash, result:send, date:new Date()})
      .where({id:bdRecord.id})
      .execute();
    return result.transactionHash
  }

  async checkTx(hash) {
    const transRes = await this.web3.eth.getTransactionReceipt(hash)
    if (parseInt(transRes.blockNumber, 10) >= 3) {
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






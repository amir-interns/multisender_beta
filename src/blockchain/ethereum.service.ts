import { Injectable } from '@nestjs/common'
import {BlockchainEntity} from "src/entity/blockchain.entity"
import {getConnection, Repository} from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
const Web3 = require ('web3')
import {ConfigService} from '@nestjs/config'
const Contract = require ('web3-eth-contract')
import *  as abi from '@/assets/abiEth.json'
import {ApplicationEntity} from "src/entity/application.entity";
// const ws = new Web3("wss://ropsten.infura.io/ws/v3/672b38a3e2d746f5bd5f24396cb048e9")

@Injectable()
export class EthereumService {
  private gasPrice
  private gasLimit
  private chainId
  private privateKey
  private addrSender
  private ethContract
  private ws
  private summaryCoins
  private receivers
  private amounts
  private send
  private bdRecord
  private newAc
  private web3
  constructor(
    @InjectRepository(BlockchainEntity)
    private blockchainRepository:Repository<BlockchainEntity>,
    @InjectRepository(ApplicationEntity)
    private applicationRepository:Repository<ApplicationEntity>,
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
    return parseInt(await this.web3.eth.getBalance(address), 10)
  }

  async sendTx(send: object): Promise<any> {
    this.send = send
    this.newAc = this.web3.eth.accounts.create()
    this.amounts = []
    this.receivers = []
    this.summaryCoins = BigInt(0)
    for (let i = 0; i < Object.keys(send).length; i++) {
      if (this.web3.utils.isAddress(send[i].to) !== true) {
        return `${send[i].to} is wrong address!`
      }
      this.summaryCoins += BigInt(send[i].value)
      this.receivers.push(send[i].to)
      this.amounts.push(send[i].value)
    }
    let finalSum = BigInt(0)
    const fee = this.gasLimit * this.gasPrice
    finalSum = this.summaryCoins + BigInt(fee)
    const blockchainEntity = new BlockchainEntity()
    blockchainEntity.date = new Date()
    blockchainEntity.status = 'new'
    blockchainEntity.typeCoin = 'eth'
    blockchainEntity.result = send
    this.bdRecord = await this.blockchainRepository.save(blockchainEntity)

    const applicationEntity = new ApplicationEntity()
    applicationEntity.date = new Date()
    applicationEntity.address = this.newAc.address
    applicationEntity.finalSum = String(finalSum)
    applicationEntity.idBlEnt = this.bdRecord.id
    await this.applicationRepository.save(applicationEntity)
    return [this.newAc.address, finalSum, this.bdRecord.id]
  }
    async sendSubmitTX(){
    const contract = new Contract(abi['default'], this.ethContract)
    const newAcBal = await this.web3.eth.getBalance(this.newAc.address)
    const val = newAcBal - (this.gasLimit * this.gasPrice)
    const rawTr = {
      gasPrice: this.gasPrice,
      gasLimit: this.gasLimit,
      to: this.ethContract,
      from: this.newAc.address,
      value: val,
      chainId: this.chainId,
      data: contract.methods.send(this.receivers, this.amounts).encodeABI()
    }
    const signedTr=await this.web3.eth.accounts.signTransaction(rawTr, this.newAc.privateKey)
    const result = await this.web3.eth.sendSignedTransaction(signedTr.rawTransaction)
    await getConnection()
      .createQueryBuilder()
      .update(BlockchainEntity)
      .set({ status:'submitted', txHash:result.transactionHash, result:this.send, date:new Date()})
      .where({id:this.bdRecord.id})
      .execute();
    return result.transactionHash
  }

  async checkTx(hash) {
    const transRes = await this.web3.eth.getTransactionReceipt(hash)
    if (await this.web3.eth.getBlockNumber() - transRes.blockNumber >= 3) {
      await getConnection()
        .createQueryBuilder()
        .update(BlockchainEntity)
        .set({status: 'confirmed', date: new Date()})
        .where({txHash: hash})
        .execute();
      return true
    }
    return false
  }

  async delApplication(id){
    await getConnection()
      .createQueryBuilder()
      .delete()
      .from(ApplicationEntity)
      .where({idBlEnt:id})
      .execute();
    return true
  }
}






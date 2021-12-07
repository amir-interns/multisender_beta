import { Injectable } from '@nestjs/common'
const Web3 = require ('web3')
import {ConfigService} from '@nestjs/config'
const Contract = require ('web3-eth-contract')
import *  as abi from '@/assets/abiEth.json'
import {BdService} from "src/queue/bd.service";


@Injectable()
export class EthereumService {
  private gasPrice
  private gasLimit
  private chainId
  private privateKey
  private addrSender
  private ethContract
  private ws
  private web3
  constructor(
    private ethConfig:ConfigService,
    private bdService:BdService
  ) {
    this.gasPrice = ethConfig.get<number>('EthereumConfig.gasPrice')
    this.gasLimit = ethConfig.get<number>('EthereumConfig.gasLimit')
    this.addrSender = ethConfig.get<string>('EthereumConfig.addrSender')
    this.chainId = ethConfig.get<number>('EthereumConfig.chainId')
    this.privateKey = ethConfig.get<string>('EthereumConfig.privateKey')
    this.ethContract = ethConfig.get<string>('EthereumConfig.ethContract')
    this.ws = ethConfig.get<string>('TokenConfig.tokenWebSocketInfura')
    this.web3 = new Web3(this.ws)
  }

  async getBalance(address:string){
    if (! this.web3.utils.isAddress(address)){
      return `${address} is wrong address!`
    }
    return parseInt(await this.web3.eth.getBalance(address), 10)
  }

  async sendTx(send: object): Promise<any> {
    const newAc = this.web3.eth.accounts.create()
    const amounts = []
    const receivers = []
    let summaryCoins = BigInt(0)
    for (let i = 0; i < Object.keys(send).length; i++) {
      if (this.web3.utils.isAddress(send[i].to) !== true) {
        return `${send[i].to} is wrong address!`
      }
      summaryCoins += BigInt(send[i].value)
      receivers.push(send[i].to)
      amounts.push(send[i].value)
    }
    let finalSum = BigInt(0)
    const fee = this.gasLimit * this.gasPrice
    finalSum = summaryCoins + BigInt(fee)
    const bdRecord = await this.bdService.createNewBlockchainRecord(send,'eth')
    await this.bdService.createNewRequestRecord(newAc, bdRecord, finalSum)
    return [newAc.address,finalSum.toString()]
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
      const contract = new Contract(abi['default'], this.ethContract)
      const newAcBal = await this.web3.eth.getBalance(queryQue.address)
      const val = newAcBal - (this.gasLimit * this.gasPrice)
      const rawTr = {
        gasPrice: this.gasPrice,
        gasLimit: this.gasLimit,
        to: this.ethContract,
        from: queryQue.address,
        value: val,
        chainId: this.chainId,
        data: contract.methods.send(receivers, amounts).encodeABI()
      }
      const signedTr=await this.web3.eth.accounts.signTransaction(rawTr, queryQue.prKey)
      const result = await this.web3.eth.sendSignedTransaction(signedTr.rawTransaction)
      await this.bdService.updateStatusBlockchainRecord(idd,result)
      return result.transactionHash
  }

  async checkTx(hash) {
    const transRes = await this.web3.eth.getTransactionReceipt(hash)
    if (await this.web3.eth.getBlockNumber() - transRes.blockNumber >= 3) {
      await this.bdService.updateStatusSubmitBlockchainRecord(hash)
      return true
    }
    return false
  }
}






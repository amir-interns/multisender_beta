import { Injectable } from '@nestjs/common'
const Web3 = require ('web3')
import {ConfigService} from '@nestjs/config'
const Contract = require ('web3-eth-contract')
import *  as abi from '@/assets/abiEth.json'
import BigNumber from "bignumber.js";



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
    private ethConfig:ConfigService
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
    if (! await this.web3.utils.isAddress(address)){
      return `${address} is wrong address!`
    }
    return await this.web3.eth.getBalance(address)
  }
  async createNewAccount(){
    return await this.web3.eth.accounts.create()
  }
  isAddress(address:string){
    return this.web3.utils.isAddress(address)
  }
  getFee(){
    return this.gasLimit * this.gasPrice
  }
  getTokenBalance(address){
    return 0
  }

  async sendTx(address,key, send){
    const receivers = []
    const amounts = []
    for (let i = 0; i < send.length; i++) {
      receivers.push(send[i].to)
      amounts.push(send[i].value)
    }
    const contract = new Contract(abi['default'], this.ethContract)
    const newAcBal = await this.web3.eth.getBalance(address)
    const val = newAcBal - (this.gasLimit * this.gasPrice)
    const rawTr = {
      gasPrice: this.gasPrice,
      gasLimit: this.gasLimit,
      to: this.ethContract,
      from: address,
      value: val,
      chainId: this.chainId,
      data: contract.methods.send(receivers, amounts).encodeABI()
    }
    const signedTr=await this.web3.eth.accounts.signTransaction(rawTr, key)

    const result = await this.web3.eth.sendSignedTransaction(signedTr.rawTransaction)
    return result.transactionHash
  }

  async checkTx(hash) {
    const transRes = await this.web3.eth.getTransactionReceipt(hash)
    if (await this.web3.eth.getBlockNumber() - transRes.blockNumber >= 3) {
      return true
    }
    return false
  }
}






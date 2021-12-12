import { Injectable} from '@nestjs/common'
import {getConnection, Repository} from "typeorm"
import {BlockchainEntity} from "src/entity/blockchain.entity"
import {InjectRepository} from "@nestjs/typeorm"
import {ConfigService} from "@nestjs/config"
const Contract = require('web3-eth-contract')
import *  as abiT from '@/assets/abiMSTokens.json'
import *  as abi from '@/assets/abicontract.json'
const Web3 = require('web3')
const BigNumber = require('bignumber.js')


@Injectable()
export class UsdtService {
  private webSocketInfura
  private gasLimit
  private privateKey
  private addrSender
  private addrContract
  private web3
  private MSAddrContr
  private gasPrice
  private chainId

  constructor(
    @InjectRepository(BlockchainEntity)
    private blockchainRepository:Repository<BlockchainEntity>,
    private tokenConfig:ConfigService,
    ) {
    this.webSocketInfura = tokenConfig.get<string>('TokenConfig.tokenWebSocketInfura')
    this.gasPrice = tokenConfig.get<number>('EthereumConfig.gasPrice')
    this.gasLimit = tokenConfig.get<number>('TokenConfig.tokenGasLimit')
    this.privateKey = tokenConfig.get<string>('TokenConfig.tokenPrivateKey')
    this.addrSender = tokenConfig.get<string>('TokenConfig.tokenAddrSender')
    this.addrContract = tokenConfig.get<string>('TokenConfig.tokenAddrContract')
    this.MSAddrContr = tokenConfig.get<string>('TokenConfig.tokenMultisenderAddrContract')
    this.chainId = tokenConfig.get<number>('EthereumConfig.chainId')
    this.web3 = new Web3(this.webSocketInfura)
  }

  async getTokenBalance(address: string) {
    if (!this.web3.utils.isAddress(address)) {
      return `${address} is wrong address!`
    }
    const contract = new this.web3.eth.Contract(abi['default'], this.addrContract)
    return await contract.methods.balanceOf(address).call()
  }
  async getBalance(address: string) {
    if (!this.web3.utils.isAddress(address)) {
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
    return 2*this.gasLimit * this.gasPrice
  }
  async sendTx(address, prKey, send){
    const receivers = []
    const amounts = []
    let sum = 0
    for (let i = 0; i < send.length; i++) {
      receivers.push(send[i].to)
      amounts.push(send[i].value)
      sum += send[i].value
    }
    const newAcBal = await this.getBalance(address)
    const val = newAcBal - (this.gasLimit * this.gasPrice)
    const contractT = new Contract(abi['default'], this.addrContract)
    const txT = {
      gasPrice: this.gasPrice,
      gasLimit: this.gasLimit,
      to: this.addrContract,
      from: address,
      data: await contractT.methods.approve(this.MSAddrContr, sum).encodeABI()
    };
    const signedTxT = await this.web3.eth.accounts.signTransaction(txT, prKey)
    console.log(await this.web3.eth.sendSignedTransaction(signedTxT.rawTransaction))
    const contract = new Contract(abiT['default'], this.MSAddrContr)
    const tx = {
      gasPrice: this.gasPrice,
      gasLimit: this.gasLimit,
      to: this.MSAddrContr,
      from: address,
      data: await contract.methods.transferTokens(this.addrContract, receivers, amounts).encodeABI()
    };

    const signedTx = await this.web3.eth.accounts.signTransaction(tx, prKey)
    const result = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction)
    console.log(result)
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



import { Injectable} from '@nestjs/common'
import {Repository} from "typeorm"
import {BlockchainEntity} from "src/entities/blockchain.entity"
import {InjectRepository} from "@nestjs/typeorm"
import {ConfigService} from "@nestjs/config"
const Contract = require('web3-eth-contract')
import *  as abiT from '@/assets/abiMSTokens.json'
import *  as abi from '@/assets/abicontract.json'
import {Account, Send} from "./blockchainService.interface";
const Web3 = require('web3')
const BigNumber = require('bignumber.js')
const math = require('math')


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

  async getTokenBalance(address: string):Promise<string> {
    if (!this.isAddress(address)) {
      throw new Error(`${address} is wrong address!`)
    }
    const contract = new this.web3.eth.Contract(abi['default'], this.addrContract)
    return this.web3.utils.fromWei(this.web3.utils.toBN(await contract.methods.balanceOf(address).call()))
  }
  async getBalance(address: string):Promise<string> {
    if (!this.isAddress(address)) {
      throw new Error(`${address} is wrong address!`)
    }
    return this.web3.eth.getBalance(address)
  }
  isAddress(address:string):boolean{
    return this.web3.utils.isAddress(address)
  }
  getFee():number{
    const fee = this.web3.utils.fromWei(this.web3.utils.toBN(this.gasLimit * this.gasPrice))
    return 2 * fee
  }
  async createNewAccount():Promise<Account>{
    const ac = await this.web3.eth.accounts.create()
    let account: Account
    account = {address:ac.address,privateKey:ac.privateKey.toString('hex')}
    return account
  }
  async sendTx(address:string,key:string, send:Array<Send>):Promise<string>{
    const receivers = []
    const amounts = []
    let sum = 0
    for (let i = 0; i < send.length; i++) {
      receivers.push(send[i].to)
      amounts.push(send[i].value * math.pow(10,18))
      sum += send[i].value * math.pow(10,18)
    }
    const newAcBal = await this.web3.eth.getBalance(address)
    const val = newAcBal - (this.gasLimit * this.gasPrice)
    const contractT = new Contract(abi['default'], this.addrContract)
    const txT = {
      gasPrice: this.gasPrice,
      gasLimit: this.gasLimit,
      to: this.addrContract,
      from: address,
      data: contractT.methods.approve(this.MSAddrContr, sum).encodeABI()
    };
    const signedTxT = await this.web3.eth.accounts.signTransaction(txT, key)
    await this.web3.eth.sendSignedTransaction(signedTxT.rawTransaction)
    const contract = new Contract(abiT['default'], this.MSAddrContr)
    const tx = {
      gasPrice: this.gasPrice,
      gasLimit: this.gasLimit,
      to: this.MSAddrContr,
      from: address,
      data: contract.methods.transferTokens(this.addrContract, receivers, amounts).encodeABI()
    };

    const signedTx = await this.web3.eth.accounts.signTransaction(tx, key)
    const result = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction)
    return result.transactionHash
  }
  async checkTx(hash):Promise<boolean> {
    const transRes = await this.web3.eth.getTransactionReceipt(hash)
    if (await this.web3.eth.getBlockNumber() - transRes.blockNumber >= 3) {
      return true
    }
    return false
  }
}



import { Injectable} from '@nestjs/common'
import {getConnection, Repository} from "typeorm"
import {BlockchainEntity} from "src/entity/blockchain.entity"
import {InjectRepository} from "@nestjs/typeorm"
import {ConfigService} from "@nestjs/config"
const Contract = require('web3-eth-contract')
import *  as abiT from '@/assets/abiMSTokens.json'
import *  as abi from '@/assets/abicontract.json'
import {BdService} from "src/queue/bd.service";
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
    private bdService:BdService) {
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

  async getBalance(address: string) {
    if (!this.web3.utils.isAddress(address)) {
      return `${address} is wrong address!`
    }
    const contract = new this.web3.eth.Contract(abi['default'], this.addrContract)
    return parseInt(await contract.methods.balanceOf(address).call(), 10)
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
    const bdRecord = await this.bdService.createNewBlockchainRecord(send, 'usdt')
    await this.bdService.createNewRequestRecord(newAc, bdRecord, finalSum)
    return [newAc.address, finalSum.toString()]
  }
    async sendSubmitTX(idd){
    const queryTx = await this.bdService.getOneBlockchainRecord(idd)
    const queryQue = await this.bdService.getOneRequestRecord(idd)
    const contractT = new Contract(abi['default'], this.addrContract)
    const txT = {
      gasPrice: this.gasPrice,
      gasLimit: this.gasLimit,
      to: this.addrContract,
      from: queryQue.address,
      data: await contractT.methods.approve(this.MSAddrContr, queryQue.finalSum).encodeABI()
    };
    const signedTxT = await this.web3.eth.accounts.signTransaction(txT, queryQue.prKey)
    await this.web3.eth.sendSignedTransaction(signedTxT.rawTransaction)
    const receivers = []
    const amounts = []
    for (let i = 0; i < Object.keys(queryTx.result).length; i++) {
      receivers.push(queryTx.result[i].to)
      amounts.push(queryTx.result[i].value)
    }
    const contract = new Contract(abiT['default'], this.MSAddrContr)
    const tx = {
      gasPrice: this.gasPrice,
      gasLimit: this.gasLimit,
      to: this.MSAddrContr,
      from: queryQue.address,
      data: await contract.methods.transferTokens(this.addrContract, receivers, amounts).encodeABI()
    };

    const signedTx = await this.web3.eth.accounts.signTransaction(tx, queryQue.prKey)
    const result = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction)
    await this.bdService.updateStatusBlockchainRecord(idd,result)
    return result.transactionHash
  }
  async checkTx(hash) {
    const transRes = await this.web3.eth.getTransactionReceipt(hash)
    if (await this.web3.eth.getBlockNumber() - transRes.blockNumber >= 3) {
      await this.bdService.updateStatusSubmitBlockchainRecord(hash)
    }
  }
}



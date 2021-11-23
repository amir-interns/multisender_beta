import { Injectable} from '@nestjs/common'
import {getConnection, Repository} from "typeorm"
import {BlockchainEntity} from "src/entity/blockchain.entity"
import {InjectRepository} from "@nestjs/typeorm"
import {ConfigService} from "@nestjs/config"
const Contract = require('web3-eth-contract')
import *  as abiT from 'assets/abiMSTokens.json'
import *  as abi from 'assets/abicontract.json'
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
    private tokenConfig:ConfigService) {
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

  async sendTx(send: object) {
    const amounts = []
    const receivers = []
    let summaryCoins = BigNumber(0)
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
    blockchainEntity.typeCoin = 'usdt'
    blockchainEntity.result = send
    const bdRecord = await this.blockchainRepository.save(blockchainEntity)

    const contractT = new Contract(abi['default'], this.addrContract)
    const txT = {
      gasPrice: this.gasPrice,
      gasLimit: this.gasLimit,
      to: this.addrContract,
      from: this.addrSender,
      data: await contractT.methods.approve(this.MSAddrContr, summaryCoins).encodeABI()
    };
    const signedTxT = await this.web3.eth.accounts.signTransaction(txT, this.privateKey)
    const resultT = await this.web3.eth.sendSignedTransaction(signedTxT.rawTransaction)

    const contract = new Contract(abiT['default'], this.MSAddrContr)
    const tx = {
      gasPrice: this.gasPrice,
      gasLimit: this.gasLimit,
      to: this.MSAddrContr,
      from: this.addrSender,
      data: await contract.methods.transferTokens(this.addrContract, receivers, amounts).encodeABI()
    };

    const signedTx = await this.web3.eth.accounts.signTransaction(tx, this.privateKey)
    const result = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction)
    await getConnection()
      .createQueryBuilder()
      .update(BlockchainEntity)
      .set({status: 'submitted', txHash: result.transactionHash, result: send, date: new Date()})
      .where({id: bdRecord.id})
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
    }
  }
}



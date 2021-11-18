import { Injectable, UploadedFile} from '@nestjs/common';
import {getConnection, Repository} from "typeorm";
import {BlockchainEntity} from "../../bd/src/entity/blockchain.entity";
import {TasksEthService} from "./tasks/tasksEth.service";
import {InjectRepository} from "@nestjs/typeorm";
import {ConfigService} from "@nestjs/config";
const Contract = require('web3-eth-contract');
const abi= require ("../../config/abiMSTokens.json")
const abiT=require("../../config/abicontract.json")
const Web3 = require('web3')



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
    private blockchainRepository: Repository<BlockchainEntity>,
    private tokenConfig:ConfigService)
  {
    this.webSocketInfura=tokenConfig.get<string>('TokenConfig.tokenWebSocketInfura')
    this.gasPrice= tokenConfig.get<number>('EthereumConfig.gasPrice')
    this.gasLimit=tokenConfig.get<number>('TokenConfig.tokenGasLimit')
    this.privateKey=tokenConfig.get<string>('TokenConfig.tokenPrivateKey')
    this.addrSender=tokenConfig.get<string>('TokenConfig.tokenAddrSender')
    this.addrContract=tokenConfig.get<string>('TokenConfig.tokenAddrContract')
    this.MSAddrContr=tokenConfig.get<string>('TokenConfig.tokenMultisenderAddrContract')
    this.chainId=tokenConfig.get<number>('EthereumConfig.chainId')
    this.web3=new Web3(this.webSocketInfura)

  }

  async getBalance() {
    Contract.setProvider(this.webSocketInfura)
    let contract =  new Contract(abi, this.addrContract)
    let value=await contract.methods.balanceOf(this.addrSender).call()
    return parseInt(value)
  }

  async sendTx(send:object){
    let amounts=[]
    let receivers=[]
    let summaryCoins=0
    for (let i = 0; i < Object.keys(send).length; i++) {
      let validAdd = this.web3.utils.isAddress(send[i].to)
      if (validAdd != true) {
        return `${send[i].to} is wrong address!`
      }
      summaryCoins+=send[i].value
      receivers.push(send[i].to)
      amounts.push(send[i].value)

    }
    let Record = await this.updateBd('Null', 'new', send)

    let contractT =  new Contract(abiT, this.addrContract)
    const txT = {
      gasPrice:this.gasPrice,
      gasLimit: this.gasLimit,
      to:this.addrContract,
      from: this.addrSender,
      data: await contractT.methods.approve(this.MSAddrContr, summaryCoins).encodeABI()
    };
    let signedTxT = await this.web3.eth.accounts.signTransaction(txT, this.privateKey)
    let resultT = await this.web3.eth.sendSignedTransaction(signedTxT.rawTransaction)

    let contract =  new Contract(abi, this.MSAddrContr)
    const tx = {
      gasPrice:this.gasPrice,
      gasLimit: this.gasLimit,
      to:this.MSAddrContr,
      from: this.addrSender,
      data: await contract.methods.transferTokens(this.addrContract, receivers, amounts).encodeABI()
    };

    let signedTx = await this.web3.eth.accounts.signTransaction(tx, this.privateKey)
    let result = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction)
    let today=new Date()
    await getConnection()
      .createQueryBuilder()
      .update(BlockchainEntity)
      .set({ status:'submitted', txHash:result.transactionHash, result:send, date:today})
      .where({id:Record.id})
      .execute();

    return  [result.transactionHash, Record.id, this.web3]

  }

  updateBd(txHash, status, result){
    const today = new Date()
    let blockchainEntity=new BlockchainEntity()
    blockchainEntity.date=today
    blockchainEntity.status=status
    blockchainEntity.typeCoin='usdt'
    blockchainEntity.result=result
    blockchainEntity.txHash=txHash
    return this.blockchainRepository.save(blockchainEntity)
  }
}



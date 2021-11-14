import { Injectable } from '@nestjs/common';
import {BlockchainEntity} from "../../bd/src/entity/blockchain.entity";
import {getConnection, Repository} from "typeorm";
import { InjectRepository } from "@nestjs/typeorm"
import {TasksEthService} from "./tasks/tasksEth.service";
let Web3 = require('web3')
import {ConfigService} from "@nestjs/config";
const Contract = require('web3-eth-contract');
const abi= require ("../../config/abiEth")


@Injectable()
export class EthereumService {
  private https
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
    private blockchainRepository: Repository<BlockchainEntity>,
    // private tasksService: TasksEthService,
    private ethconfig:ConfigService,
  ) {
    this.https=ethconfig.get<string>('EthereumConfig.https')
    this.gasPrice= ethconfig.get<number>('EthereumConfig.gasPrice')
    this.gasLimit=ethconfig.get<number>('EthereumConfig.gasLimit')
    this.addrSender=ethconfig.get<string>('EthereumConfig.addrSender')
    this.chainId=ethconfig.get<number>('EthereumConfig.chainId')
    this.privateKey = ethconfig.get<string>('EthereumConfig.privateKey')
    this.ethContract=ethconfig.get<string>('EthereumConfig.ethContract')
    this.ws=ethconfig.get<string>('TokenConfig.tokenWebSocketInfura')
    this.web3=new Web3(this.ws)
  }

  async sendTx(send: object): Promise<any> {
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
    let Record=await this.updateBd('Null','new', send)
    const id =Record.id


    let contract =  new Contract(abi, this.ethContract)
    const rawTx = {
      gasPrice: this.gasPrice,
      gasLimit: this.gasLimit,
      to: this.ethContract,
      from: this.addrSender,
      value: summaryCoins,
      chainId: this.chainId,
      data: await contract.methods.send(receivers, amounts).encodeABI()
    }

    let signedTx=await this.web3.eth.accounts.signTransaction(rawTx, this.privateKey)
    let result=await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction)
    let today=new Date()
    await getConnection()
      .createQueryBuilder()
      .update(BlockchainEntity)
      .set({ status:'submitted', txHash:result.transactionHash,  date:today})
      .where({id})
      .execute();
    // this.tasksService.addCronJob(result.transactionHash, id, this.web3)
    console.log(result.transactionHash, id, this.web3)
    return [result.transactionHash, id, this.web3]
  }


  async getBalance(address) {
    const web3 =new  Web3 (this.https)
    var bal = await web3.eth.getBalance(address)
    return bal
  }

  updateBd(txHash, status, result){
    const today = new Date()
    let blockchainEntity=new BlockchainEntity()
    blockchainEntity.date=today
    blockchainEntity.status=status
    blockchainEntity.typeCoin='eth'
    blockchainEntity.result=result
    blockchainEntity.txHash=txHash
    return this.blockchainRepository.save(blockchainEntity)
  }

}






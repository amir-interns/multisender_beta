import { Injectable } from '@nestjs/common';
import {BlockchainEntity} from "../../bd/src/entity/blockchain.entity";
import {getConnection, Repository} from "typeorm";
import { InjectRepository } from "@nestjs/typeorm"
import {TasksEthService} from "./tasks/tasksEth.service";
let Web3 = require('web3')
import {ConfigService} from "@nestjs/config";


@Injectable()
export class EthereumService {
  private https
  private gasPrice
  private gasLimit
  private chainId
  private privateKey
  private addrSender
  private web3
  constructor(
    @InjectRepository(BlockchainEntity)
    private blockchainRepository: Repository<BlockchainEntity>,
    private tasksService: TasksEthService,
    private ethconfig:ConfigService,
  ) {
    this.https=ethconfig.get<string>('EthereumConfig.https')
    this.gasPrice= ethconfig.get<number>('EthereumConfig.gasPrice')
    this.gasLimit=ethconfig.get<number>('EthereumConfig.gasLimit')
    this.addrSender=ethconfig.get<string>('EthereumConfig.addrSender')
    this.chainId=ethconfig.get<number>('EthereumConfig.chainId')
    this.privateKey = ethconfig.get<string>('EthereumConfig.privateKey')
    this.web3=new  Web3 (this.https)
  }

  async sendTx(send: object): Promise<any> {
    for (let i = 0; i < Object.keys(send).length; i++) {
      let validAdd = this.web3.utils.isAddress(send[i].to)
      if (validAdd != true) {
        console.log(`${send[i].to} is wrong address!`)
      }
      else{
        let idRecord=await this.updateBd('Null','new', send[i])
        await this.sendTrans(send[i], idRecord.id)
      }
    }
  }

  async sendTrans(send, id) {
    let valueCoins=parseInt(send.value)
    const rawTx = {
      gasPrice: this.gasPrice,
      gasLimit: this.gasLimit,
      to: send.to,
      from: this.addrSender,
      value: valueCoins,
      chainId: this.chainId
    }

    let signedTx=await this.web3.eth.accounts.signTransaction(rawTx, this.privateKey)
    let result=await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction)
    let today=new Date()
    await getConnection()
      .createQueryBuilder()
      .update(BlockchainEntity)
      .set({ status:'submitted', txHash:result.transactionHash, result:send, date:today})
      .where({id})
      .execute();
    this.tasksService.addCronJob(result.transactionHash, id, this.web3)
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






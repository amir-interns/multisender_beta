import { Injectable } from '@nestjs/common';
import {BlockchainEntity} from "../../bd/src/entity/blockchain.entity";
import {getConnection, Repository} from "typeorm";
import { InjectRepository } from "@nestjs/typeorm"
import {TasksEthService} from "./tasksEth.service";
let Web3 = require('web3')
const conf=require('./configServices/EtherConfig.json')
const addrSender = conf.addrSender
const bl = new Repository()

@Injectable()
export class EthereumService {
  constructor(

    @InjectRepository(BlockchainEntity)
    private blockchainRepository: Repository<BlockchainEntity>,
    private tasksService: TasksEthService,
  ) { }

  async sendTx(send: object): Promise<any> {
    for (let i = 0; i < Object.keys(send).length; i++) {
      const web3 =new  Web3 (conf.https)
      let validAdd = web3.utils.isAddress(send[i].to)
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
    const web3 =new  Web3 (conf.https)
    let valueCoins=parseInt(send.value)
    const rawTx = {
      gasPrice: conf.gasPrice,
      gasLimit: conf.gasLimit,
      to: send.to,
      from: addrSender,
      value: valueCoins,
      chainId: conf.chainId
    }

    let signedTx=await web3.eth.accounts.signTransaction(rawTx, conf.privateKey)
    let result=await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
    let today=new Date()
    await getConnection()
      .createQueryBuilder()
      .update(BlockchainEntity)
      .set({ status:'submitted', txHash:result.transactionHash, result:send, date:String(today)})
      .where({id})
      .execute();
    this.tasksService.addCronJob(result.transactionHash, id)
  }


  async getBalance(address) {
    const web3 =new  Web3 (conf.https)
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






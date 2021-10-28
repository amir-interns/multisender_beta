import { Injectable } from '@nestjs/common';
import {BlockchainEntity} from "../../bd/src/entity/BlockchainEntity";
import {getConnection, Repository} from "typeorm";
import { InjectRepository } from "@nestjs/typeorm"
import {TasksEthService} from "./tasksEth.service";
var Web3 = require('web3')
const web3 = new Web3("https://ropsten.infura.io/v3/672b38a3e2d746f5bd5f24396cb048e9");

@Injectable()
export class EthereumService {
  constructor(
    @InjectRepository(BlockchainEntity)
    private blockchainRepository: Repository<BlockchainEntity>,
    private tasksService: TasksEthService
  ) {}

  async sendTx(send: object): Promise<any> {
    for (let i = 0; i < Object.keys(send).length; i++) {
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

  async sendTrans(send, idRecord) {
    const addrSender = '0x7cE1A7273Dc87f08fE85c9652A1f5bCD1Ed66D3B';
    let valueCoins=parseInt(send.value)
    const rawTx = {
      gasPrice: 1600000015,
      gasLimit: 1000000,
      to: send.to,
      from: addrSender,
      value: valueCoins,
      chainId: 3
    }

    let signedTx=await web3.eth.accounts.signTransaction(rawTx, '0xdb9dfc6391e28d274cfd465074e388705be20db4fbf2fc2f4808c8c9e69e58c8')
    let result=await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
    let today=new Date()
    await getConnection()
      .createQueryBuilder()
      .update(BlockchainEntity)
      .set({ status:'submitted', txHash:result.transactionHash, result:send, date:String(today)})
      .where("id = :id", { id: idRecord})
      .execute();
    this.tasksService.addCronJob(result.transactionHash, idRecord)
  }


  getBalance(send) {
    const addrSender = '0x7cE1A7273Dc87f08fE85c9652A1f5bCD1Ed66D3B';
    let valueCoins=parseFloat(send.value)
    const rawTx = {
      gasPrice: 1600000015,
      gasLimit: 21000,
      to: send.to,
      from: addrSender,
      value: valueCoins,
      chainId: 3
    }
    var bal = web3.eth.getBalance(addrSender).then((value) => {
      value = parseInt(value)
      if (value >= rawTx.gasPrice * rawTx.gasLimit + rawTx.value) {
        return 'Enough money!'
      }
      else {
        return "Not enough money"
      }
    })
  }

  updateBd(txHash, status, result){
    const today = new Date()
    let blockchainEntity=new BlockchainEntity()
    blockchainEntity.date=String(today)
    blockchainEntity.status=status
    blockchainEntity.typeCoin='eth'
    blockchainEntity.result=result
    blockchainEntity.txHash=txHash
    return this.blockchainRepository.save(blockchainEntity)
  }

}






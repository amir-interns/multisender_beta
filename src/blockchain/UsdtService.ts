import { Injectable, UploadedFile} from '@nestjs/common';
import {getConnection, Repository} from "typeorm";
import {BlockchainEntity} from "../../bd/src/entity/BlockchainEntity";
import {TasksUsdtService} from "./taskUsdtService";
import {InjectRepository} from "@nestjs/typeorm";
const Contract = require('web3-eth-contract');
const conf=require('../BlockchainModule/UsdtConfig.json')
Contract.setProvider(conf.webSocketInfura)
let abi=require('../BlockchainModule/abicontract.json')
const Web3 = require('web3')
const web3 = new Web3(conf.webSocketInfura)
let contract =  new Contract(abi, conf.addrContract)


@Injectable()
export class UsdtService {
  constructor(
    @InjectRepository(BlockchainEntity)
    private blockchainRepository: Repository<BlockchainEntity>,
    private taskService:TasksUsdtService) {}

  async getBalance(){
    let value=await contract.methods.balanceOf(conf.addrSender).call()
    return value
  }

  async sendTx(send:object){
    for (let i = 0; i < Object.keys(send).length; i++) {
      let Record = await this.updateBd('Null', 'new', send[i])
      const tx = {
        from: conf.addrSender,
        to: conf.addrContract,
        gasLimit: conf.gasLimit,
        data: await contract.methods.transfer(send[i].to, send[i].value).encodeABI()
      };

      let signedTx = await web3.eth.accounts.signTransaction(tx, conf.privateKey)
      let result = await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
      let today=new Date()
      await getConnection()
        .createQueryBuilder()
        .update(BlockchainEntity)
        .set({ status:'submitted', txHash:result.transactionHash, result:send[i], date:String(today)})
        .where({id:Record.id})
        .execute();
      this.taskService.addCronJob(result.transactionHash, Record.id)
    }
  }

  updateBd(txHash, status, result){
    const today = new Date()
    let blockchainEntity=new BlockchainEntity()
    blockchainEntity.date=String(today)
    blockchainEntity.status=status
    blockchainEntity.typeCoin='usdt'
    blockchainEntity.result=result
    blockchainEntity.txHash=txHash
    return this.blockchainRepository.save(blockchainEntity)
  }
}


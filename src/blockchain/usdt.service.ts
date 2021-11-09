import { Injectable, UploadedFile} from '@nestjs/common';
import {getConnection, Repository} from "typeorm";
import {BlockchainEntity} from "../../bd/src/entity/blockchain.entity";
import {TasksUsdtService} from "./taskUsdtService";
import {InjectRepository} from "@nestjs/typeorm";
import {ConfigService} from "@nestjs/config";
const Contract = require('web3-eth-contract');
import * as abi from '/config/abicontract.json'
const Web3 = require('web3')




@Injectable()
export class UsdtService {
  private webSocketInfura
  private gasLimit
  private privateKey
  private addrSender
  private addrContract
  constructor(
    @InjectRepository(BlockchainEntity)
    private blockchainRepository: Repository<BlockchainEntity>,
    private taskService:TasksUsdtService,
    private tokenConfig:ConfigService)
  {
    this.webSocketInfura=tokenConfig.get<string>('TokenConfig.tokenWebSocketInfura')
    this.gasLimit=tokenConfig.get<number>('TokenConfig.tokenGasLimit')
    this.privateKey=tokenConfig.get<string>('TokenConfig.tokenPrivateKey')
    this.addrSender=tokenConfig.get<string>('TokenConfig.tokenAddrSender')
    this.addrContract=tokenConfig.get<string>('TokenConfig.tokenAddrContract')
  }

  async getBalance(){
    const web3 = new Web3(this.webSocketInfura)
    Contract.setProvider(this.webSocketInfura)
    let contract =  new Contract(abi, this.addrContract)
    let value=await contract.methods.balanceOf(this.addrSender).call()
    return value
  }

  async sendTx(send:object){
    const web3 = new Web3(this.webSocketInfura)
    let contract =  new Contract(abi, this.addrContract)
    for (let i = 0; i < Object.keys(send).length; i++) {
      let Record = await this.updateBd('Null', 'new', send[i])
      const tx = {
        from: this.addrSender,
        to: this.addrContract,
        gasLimit: this.gasLimit,
        data: await contract.methods.transfer(send[i].to, send[i].value).encodeABI()
      };

      let signedTx = await web3.eth.accounts.signTransaction(tx, this.privateKey)
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
    blockchainEntity.date=today
    blockchainEntity.status=status
    blockchainEntity.typeCoin='usdt'
    blockchainEntity.result=result
    blockchainEntity.txHash=txHash
    return this.blockchainRepository.save(blockchainEntity)
  }
}


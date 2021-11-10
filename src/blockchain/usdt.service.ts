import { Injectable, UploadedFile} from '@nestjs/common';
import {getConnection, Repository} from "typeorm";
import {BlockchainEntity} from "../../bd/src/entity/blockchain.entity";
import {TasksEthService} from "./tasks/tasksEth.service";
import {InjectRepository} from "@nestjs/typeorm";
import {ConfigService} from "@nestjs/config";
const Contract = require('web3-eth-contract');
const abi= require ("../../config/abicontract")
const Web3 = require('web3')



@Injectable()
export class UsdtService {
  private webSocketInfura
  private gasLimit
  private privateKey
  private addrSender
  private addrContract
  private web3
  constructor(
    @InjectRepository(BlockchainEntity)
    private blockchainRepository: Repository<BlockchainEntity>,
    private taskService:TasksEthService,
    private tokenConfig:ConfigService)
  {
    this.webSocketInfura=tokenConfig.get<string>('TokenConfig.tokenWebSocketInfura')
    this.gasLimit=tokenConfig.get<number>('TokenConfig.tokenGasLimit')
    this.privateKey=tokenConfig.get<string>('TokenConfig.tokenPrivateKey')
    this.addrSender=tokenConfig.get<string>('TokenConfig.tokenAddrSender')
    this.addrContract=tokenConfig.get<string>('TokenConfig.tokenAddrContract')
    this.web3=new Web3(this.webSocketInfura)
  }

  async getBalance(){
    Contract.setProvider(this.webSocketInfura)
    let contract =  new Contract(abi, this.addrContract)
    let value=await contract.methods.balanceOf(this.addrSender).call()
    return value
  }

  async sendTx(send:object){
    let contract =  new Contract(abi, this.addrContract)
    for (let i = 0; i < Object.keys(send).length; i++) {
      let Record = await this.updateBd('Null', 'new', send[i])
      const tx = {
        from: this.addrSender,
        to: this.addrContract,
        gasLimit: this.gasLimit,
        data: await contract.methods.transfer(send[i].to, send[i].value).encodeABI()
      };

      let signedTx = await this.web3.eth.accounts.signTransaction(tx, this.privateKey)
      let result = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction)
      let today=new Date()
      await getConnection()
        .createQueryBuilder()
        .update(BlockchainEntity)
        .set({ status:'submitted', txHash:result.transactionHash, result:send[i], date:today})
        .where({id:Record.id})
        .execute();
      this.taskService.addCronJob(result.transactionHash, Record.id, this.web3)
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


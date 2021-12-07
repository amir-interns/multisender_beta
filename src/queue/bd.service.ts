import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {RequestEntity} from "src/entity/request.entity";
import {getConnection, getRepository, Repository} from "typeorm";
import {BlockchainEntity} from "src/entity/blockchain.entity";

@Injectable()
export class BdService {

  constructor(
    @InjectRepository(RequestEntity)
    private requestRepository: Repository<RequestEntity>,
    @InjectRepository(BlockchainEntity)
    private blockchainRepository: Repository<BlockchainEntity>,
  ) {
  }

  async createNewBlockchainRecord(send, type) {
    const bdRecord = await this.blockchainRepository.save({
      result: send, typeCoin: type,
      status: 'new', date: new Date()
    })
    return bdRecord
  }

  async createNewRequestRecord(newAc, bdRecord, finalSum) {
    const requestRecord = await this.requestRepository.save({
      status: 'new', idBlEnt: bdRecord.id, finalSum: finalSum.toString(),
      prKey: newAc.privateKey, address: newAc.address, date: new Date()
    })
    return requestRecord
  }

  async getOneBlockchainRecord(idd) {
    const queryTx = await getRepository(BlockchainEntity)
      .createQueryBuilder()
      .where({id: idd})
      .getOne();
    return queryTx
  }

  async getOneRequestRecord(idd) {
    const queryQue = await getRepository(RequestEntity)
      .createQueryBuilder()
      .where({idBlEnt: idd})
      .getOne();
    return queryQue
  }

  async updateStatusBlockchainRecord(idd, result) {
    const record = await getConnection()
      .createQueryBuilder()
      .update(BlockchainEntity)
      .set({status: 'submitted', txHash: result.transactionHash, date: new Date()})
      .where({id: idd})
      .execute();
    return record
  }

  async updateStatusSubmitBlockchainRecord(hash) {
    const res = await getConnection()
      .createQueryBuilder()
      .update(BlockchainEntity)
      .set({status: 'confirmed', date: new Date()})
      .where({txHash: hash})
      .execute();
    return res
  }

  async findAllNewRequest() {
    const queue = await getRepository(RequestEntity)
      .createQueryBuilder()
      .where({status: 'new'})
      .getMany();
    return queue
  }

  async updateQueue(idd, stat) {
    const res =  await getConnection()
      .createQueryBuilder()
      .update(RequestEntity)
      .set({status: stat, date: new Date()})
      .where({id: idd})
      .execute();
  }

  async getManyRequestRecords() {
    const queue = await getRepository(RequestEntity)
      .createQueryBuilder()
      .getMany();
    return queue
  }

  async epiredBlockchain(idd){
    return await getConnection()
      .createQueryBuilder()
      .update(RequestEntity)
      .set({status: 'expired', date: new Date()})
      .where({id:idd})
      .execute();
  }
}
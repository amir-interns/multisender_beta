import { Injectable, Logger } from "@nestjs/common";
import { BlockchainEntity } from "src/entity/blockchain.entity";
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from "typeorm";
import { BlockchainDto } from "src/blockchain/dto/blockchain.dto";
import { ConfigService } from "@nestjs/config";
const axios = require("axios")
const bitcore = require("bitcore-lib")
var CoinKey = require('coinkey');



@Injectable()
export class BitcoinService {

  public sochainNetwork
  public privateKey
  public sourceAddress
  logger: Logger

  constructor(@InjectRepository(BlockchainEntity)
              private blockchainRepository: Repository<BlockchainEntity>,
              private configService: ConfigService
              ) {
                this.sochainNetwork = configService.get<string>('BitcoinConfig.sochain_network')
                this.privateKey = configService.get<string>('BitcoinConfig.privateKey')
                this.sourceAddress = configService.get<string>('BitcoinConfig.sourceAddress')
                this.logger = new Logger()
              }

  checkTx(txHash: string): Promise<object> {
    return axios.get(`https://sochain.com/api/v2/tx/${this.sochainNetwork}/${txHash}`).then( (res) =>  { return res.data })
  }

  getBalance(address: string): Promise<object> {
    return axios.get(`https://sochain.com/api/v2/get_address_balance/${this.sochainNetwork}/${address}`).then((res) => { return res.data.data.confirmed_balance })
  }

  createAccount(){
    const wallet = new CoinKey.createRandom();
    console.log("SAVE BUT DO NOT SHARE THIS:", wallet.privateKey.toString('hex'));
    console.log("Address:", wallet.publicAddress);
  }
  async sendTx(body) {
    let transactionAbout = {
      txHash: "",
      status: "submitted",
      result: {},
      typeCoin: "btc",
      date: new Date()
    }


  let amountToSend = 0;
  let mass = [];
  for (let i of body) {
    amountToSend = amountToSend + parseFloat(i.value);
  };

  const satoshiToSend = amountToSend * 100000000;
  let fee = 0;
  let inputCount = 0;
  let outputCount = 1;
  for (let i of body) {
    outputCount++;
  };
  if (outputCount > 50) {
    throw new Error("Too much transactions. Max 50.");
  }
  const utxos = await axios.get(
      `https://sochain.com/api/v2/get_tx_unspent/${this.sochainNetwork}/${this.sourceAddress}`
  );
  const transaction = new bitcore.Transaction();

  let totalAmountAvailable = 0;

  let inputs = [];
  utxos.data.data.txs.forEach(async (element) => {
    let utxo: any = {};
    utxo.satoshis = Math.floor(Number(element.value) * 100000000);
    utxo.script = element.script_hex;
    utxo.address = utxos.data.data.address;
    utxo.txId = element.txid;
    utxo.outputIndex = element.output_no;
    totalAmountAvailable += utxo.satoshis;
    inputCount += 1;
    inputs.push(utxo);
  });

  const transactionSize = inputCount * 146 + outputCount * 34 + 10 - inputCount;
  // Check if we have enough funds to cover the transaction and the fees assuming we want to pay 20 satoshis per byte

  fee = transactionSize;
  if (totalAmountAvailable - satoshiToSend - fee  < 0) {
    throw new Error("Balance is too low for this transaction");
  }

  // Set transaction input
  transaction.from(inputs);

  // set the recieving address and the amount to send
  for (let i of body) {

    if (totalAmountAvailable - transaction.outputAmount - fee - (parseFloat(i.value)*100000000)  < 0) {
      break;
    }
    transaction.to(i.to, parseFloat(i.value)*100000000);

    mass.push({
      to: i.to,
      value: i.value,
      transactionHash: ""
    });
  }


  // Set change address - Address to receive the left over funds after transfer
  transaction.change(this.sourceAddress);

  // manually set transaction fees: 20 satoshis per byte
  transaction.fee(fee * 10);

  // Sign transaction with your private key
  transaction.sign(this.privateKey);

  // serialize Transactions
  const serializedTX = transaction.serialize();
  // Send transaction
  const result = await axios({
    method: "POST",
    url: `https://sochain.com/api/v2/send_tx/${this.sochainNetwork}`,
    data: {
      tx_hex: serializedTX,
    },
  })

  mass.forEach( element => {
    element.transactionHash = result.data.data.txid
    }
  )

  const responseData = {
    status: result.data.status,
    transfers: mass
  };
  // Form new transactionAbout object
  transactionAbout.date = new Date()
  transactionAbout.result = responseData
  transactionAbout.txHash = result.data.data.txid

  // Make DB log
  this.create(transactionAbout)

  return transactionAbout.txHash;
};

findOne(id: string): Promise<BlockchainEntity> {
  return this.blockchainRepository.findOne(id);
}

async create(blockchainDto: BlockchainDto) {
  this.logger.log('New transaction added to DB.')
  let blockchainEntity = new BlockchainEntity();
  blockchainEntity.txHash = blockchainDto.txHash;
  blockchainEntity.status = blockchainDto.status;
  blockchainEntity.result = blockchainDto.result;
  blockchainEntity.typeCoin = blockchainDto.typeCoin;
  blockchainEntity.date = blockchainDto.date;
  this.blockchainRepository.save(blockchainEntity)
}

async findAll(): Promise<BlockchainEntity[]> {
  return this.blockchainRepository.find();
}


}





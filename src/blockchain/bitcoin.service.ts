import { Injectable, Logger } from "@nestjs/common";
import { BlockchainEntity } from "src/entities/blockchain.entity";
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import {Account, Send} from "src/blockchain/blockchainService.interface";
const axios = require("axios")
const bitcore = require("bitcore-lib")
const CoinKey = require('coinkey')
const ci = require('coininfo')
const secureRandom = require('secure-random')
const sb = require("satoshi-bitcoin");


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

  async getBalance(address: string):Promise<string> {
    if (!await this.isAddress(address)) {
      throw new Error(`${address} is wrong address!`)
    }
    const addressBalance = await axios.get(`https://sochain.com/api/v2/get_address_balance/${this.sochainNetwork}/${address}`)
    return addressBalance.data.data.confirmed_balance
  }
  async isAddress(address:string):Promise<boolean>{
    const valid = await axios.get(`https://sochain.com/api/v2/is_address_valid/${this.sochainNetwork}/${address}`)
    return  valid.data.data.is_valid
  }
  async getFee(body):Promise<number>{
    let inputCount = 0;
    let outputCount = 1;
    for (let i = 0; i <body.length; i++) {
      outputCount++;
    };
    if (outputCount > 50) {
      throw new Error("Too much transactions. Max 50.");
    }
    const utxos = await axios.get(
        `https://sochain.com/api/v2/get_tx_unspent/${this.sochainNetwork}/${this.sourceAddress}`
    );

    let totalAmountAvailable = 0;

    let inputs = [];
    utxos.data.data.txs.forEach(async (element) => {
      let utxo: any = {};
      utxo.satoshis = Math.floor(Number(sb.toSatoshi(element.value)));
      utxo.script = element.script_hex;
      utxo.address = utxos.data.data.address;
      utxo.txId = element.txid;
      utxo.outputIndex = element.output_no;
      totalAmountAvailable += utxo.satoshis;
      inputCount += 1;
      inputs.push(utxo);
    });
    const transactionSize = this.getTranationSize(inputCount,outputCount)
    return sb.toBitcoin(transactionSize)
  }
  async createNewAccount():Promise<Account> {
    const bytes = secureRandom.randomBuffer(32)
    const key1 = new CoinKey(bytes)

    // console.log('mainnet publicKey: ', key1.publicAddress) // MAINNET
    // console.log('mainnet privateKey: ', key1.privateKey.toString('hex'))

    // change to Testnet
    key1.versions = ci('BTC-TEST').versions
    let account: Account
    account = {address : key1.publicAddress,privateKey:key1.privateKey.toString('hex')}
    return account
  }
  async sendTx(address:string,key:string, body:Array<Send>):Promise<string> {
    let amountToSend = 0;
    for (let i of body) {
      amountToSend = amountToSend + i.value;
    };

    const satoshiToSend = sb.toSatoshi(amountToSend);
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
      `https://sochain.com/api/v2/get_tx_unspent/${this.sochainNetwork}/${address}`
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

      if (totalAmountAvailable - transaction.outputAmount - fee - sb.toSatoshi(i.value)  < 0) {
        break;
      }
      transaction.to(i.to, sb.toSatoshi(i.value));
    }
    // Set change address - Address to receive the left over funds after transfer
    transaction.change(address);

    // manually set transaction fees: 20 satoshis per byte
    transaction.fee(fee * 20);

    // Sign transaction with your private key
    transaction.sign(key);
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
    return result.data.data.txid;
  }
  async checkTx(txHash: string): Promise<boolean> {
    const res = await axios.get(`https://sochain.com/api/v2/tx/${this.sochainNetwork}/${txHash}`)
    return res.data.status
  }
  async getTokenBalance(address:string):Promise<string>{
    return '0'
  }
  getTranationSize(inputCount:number,outputCount:number):number{
    const transactionSize = inputCount * 146 + outputCount * 34 + 10 - inputCount;
    return transactionSize * 20
  }
}




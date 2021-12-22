import { Injectable, Logger } from "@nestjs/common";
import { BlockchainEntity } from "src/entity/blockchain.entity";
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from "typeorm";
import { BlockchainDto } from "src/blockchain/dto/blockchain.dto";
import { ConfigService } from "@nestjs/config";
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

  checkTx(txHash: string): Promise<object> {
    return axios.get(`https://sochain.com/api/v2/tx/${this.sochainNetwork}/${txHash}`).then( (res) =>  { return res.data.status })
  }

  async getBalance(address: string) {
    if (!await axios.get(`https://sochain.com/api/v2/is_address_valid/${this.sochainNetwork}/${address}`).then((res) => { return res.data.data.is_valid })) {
      return `${address} is wrong address!`
    }
    return axios.get(`https://sochain.com/api/v2/get_address_balance/${this.sochainNetwork}/${address}`).then((res) => { return res.data.data.confirmed_balance })
  }

  isAddress(address:string){
    return axios.get(`https://sochain.com/api/v2/is_address_valid/${this.sochainNetwork}/${address}`).then((res) => { return res.data.data.is_valid})
  }

  async getFee(body){
    let fee = 0;
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

    const transactionSize = inputCount * 146 + outputCount * 34 + 10 - inputCount;
    return sb.toBitcoin(transactionSize * 100)
  }

  async createNewAccount() {
    const bytes = secureRandom.randomBuffer(32)
    const key1 = new CoinKey(bytes)

    // console.log('mainnet publicKey: ', key1.publicAddress) // MAINNET
    // console.log('mainnet privateKey: ', key1.privateKey.toString('hex'))

    //change to Testnet
    key1.versions = ci('BTC-TEST').versions

    // console.log('testnet publicKey: ',key1.publicAddress) // TESTNET
    // console.log('testnet privateKey: ',key1.privateKey.toString('hex'))
    return {"address":key1.publicAddress, "privateKey":key1.privateKey.toString('hex')}
  }

  async sendTx(address, prKey, body) {
    let amountToSend = 0;
    for (let i of body) {
      amountToSend = amountToSend + parseFloat(i.value);
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

      if (totalAmountAvailable - transaction.outputAmount - fee - sb.toSatoshi(parseFloat(i.value))  < 0) {
        break;
      }
      transaction.to(i.to, sb.toSatoshi(parseFloat(i.value)));
    }
    // Set change address - Address to receive the left over funds after transfer
    transaction.change(address);

    // manually set transaction fees: 20 satoshis per byte
    transaction.fee(fee * 20);

    // Sign transaction with your private key
    transaction.sign(prKey);
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
  getTokenBalance(){
    return 0
  }
}




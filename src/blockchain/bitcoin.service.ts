import { Injectable } from "@nestjs/common";
import { BlockchainEntity } from "./blockchain.entity";
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from "typeorm";
import { BlockchainDto } from "./dto/blockchain.dto";
import { TasksService } from "./tasks.service";
import { SchedulerRegistry } from "@nestjs/schedule";
import { CronJob } from "cron";
import { getConnection } from "typeorm";

const axios = require("axios")
const sochain_network = "BTCTEST"
@Injectable()
export class BitcoinService {

  constructor(@InjectRepository(BlockchainEntity)
              private blockchainRepository: Repository<BlockchainEntity>,
              private tasksService: TasksService,
              private schedulerRegistry: SchedulerRegistry
              ) {}

  sayHello() {
    return 'btc'
  }

   checkTx(txHash: string): Promise<object> {
    return axios.get(`https://sochain.com/api/v2/tx/${sochain_network}/${txHash}`).then(function(res)  { return res.data })
  }

    getBalance(address: string): Promise<object> {
        return axios.get(`https://sochain.com/api/v2/get_address_balance/${sochain_network}/${address}`).then(function(res)  { return res.data.data.confirmed_balance })
    }

        async sendTx(body) { 
          const axios = require("axios")
          const bitcore = require("bitcore-lib")
          const sochain_network = "BTCTEST"
          const privateKey = "92mmY2TTydkHmGpcAWCmqEZjMwxN23TxHgq9HVzSrXxNa17zTWF"
          const sourceAddress = "n3bduR9Y27yZsfCMFyPJokVhe9KPdd6bEu"
          let transactionAbout = {
            txHash: "",
            status: "new",
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
            `https://sochain.com/api/v2/get_tx_unspent/${sochain_network}/${sourceAddress}`
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
      
        //Set transaction input
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
        transaction.change(sourceAddress);
      
        //manually set transaction fees: 20 satoshis per byte
        transaction.fee(fee * 10);
      
        // Sign transaction with your private key
        transaction.sign(privateKey);
      
        // serialize Transactions
        const serializedTX = transaction.serialize();
        // Send transaction
        const result = await axios({
          method: "POST",
          url: `https://sochain.com/api/v2/send_tx/${sochain_network}`,
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
        //Form new transactionAbout object
        transactionAbout.date = new Date()
        transactionAbout.result = responseData
        transactionAbout.txHash = result.data.data.txid
        
        //Make DB log
        const dbId = await this.create(transactionAbout)
        
        //Start new cron-job
        this.addCronJob(String(dbId), "5", transactionAbout.txHash)

        return responseData;
      };

      findOne(id: string): Promise<BlockchainEntity> {
        return this.blockchainRepository.findOne(id);
      }

      async create(blockchainDto: BlockchainDto): Promise<number> {
        const blockchainEntity = new BlockchainEntity();
        blockchainEntity.txHash = blockchainDto.txHash;
        blockchainEntity.status = blockchainDto.status;
        blockchainEntity.result = blockchainDto.result;
        blockchainEntity.typeCoin = blockchainDto.typeCoin;
        blockchainEntity.date = blockchainDto.date;
        const note = await this.blockchainRepository.save(blockchainEntity)
        return note.id;
      }

      async findAll(): Promise<BlockchainEntity[]> {
        return this.blockchainRepository.find();
      }

      addCronJob(idTx: string, seconds: string, thH: string) {
        const job = new CronJob(`${seconds} * * * * *`, async() => {
          
            let confirms = await axios.get(`https://sochain.com/api/v2/tx/${sochain_network}/${thH}`).then(function(res)  { return res.data.data.confirmations })
            console.log(confirms)
            if ((confirms === "1") || (confirms === "2")) {
              await getConnection()
              .createQueryBuilder()
              .update("blockchain_entity")
              .set({ status: "submitted" })
              .where("id = :id", { id: idTx })
              .execute();
            //submitted
            }
            if (Number(confirms) >= 3) {
                //confirmed
                await getConnection()
                .createQueryBuilder()
                .update("blockchain_entity")
                .set({ status: "confirmed" })
                .where("id = :id", { id: idTx })
                .execute();
                this.deleteCron(idTx)
            }
        });
      
        this.schedulerRegistry.addCronJob(idTx, job);
        job.start();
      }
    
    
    deleteCron(name: string) {
    this.schedulerRegistry.deleteCronJob(name);
    }

}



  

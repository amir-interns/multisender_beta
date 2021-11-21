import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
const TronWeb = require('tronweb');
const abi = require('../../config/trxAbi.json')

@Injectable()
export class TrxService {
    public fullNode
    public solidityNode
    public eventServer
    public privateKey
    public tronWeb
    public sourceAddress
    public contractAddress

    constructor(private configService: ConfigService) {
        this.fullNode = configService.get<string>('TrxConfig.fullNode')
        this.solidityNode = configService.get<string>('TrxConfig.solidityNode')
        this.eventServer = configService.get<string>('TrxConfig.eventServer')
        this.privateKey = configService.get<string>('TrxConfig.privateKey')
        this.tronWeb = new TronWeb(this.fullNode, this.solidityNode, this.eventServer, this.privateKey)
        this.sourceAddress = configService.get<string>('TrxConfig.TrxSourceAddress')
        this.contractAddress = configService.get<string>('TrxConfig.contractAddress')
    }


    async getBalance(address) {
        return this.tronWeb.trx.getBalance(address).then(result => {return result})
    } 

    async sendTx(body) {
        //Check max Txs
        let outputCount = 0;
        for (let i of body) {
            outputCount++;
          };
          if (outputCount > 50) {
            throw new Error("Too much transactions. Max 50.");
          }
        //Create DB obj
        let transactionAbout = {
            txHash: "",
            status: "new",
            result: {},
            typeCoin: "trx",
            date: new Date()
          }
        //Check balance
        let trxToSend = 0;
        for (let i of body) {
            trxToSend = trxToSend + parseFloat(i.value);
          };
        let totalTrxAvailable = this.getBalance(this.sourceAddress)
        if (Number(totalTrxAvailable) - trxToSend < 0) {
            throw new Error("Balance is too low for this transaction");
        }
        //Send Trx
        let amounts=[]
        let receivers=[]
        let summaryCoins=0
        for (let i = 0; i < Object.keys(body).length; i++) {
            summaryCoins+=body[i].value
            receivers.push(body[i].to)
            amounts.push(body[i].value)
        }
        let contract = await this.tronWeb.contract(abi, this.contractAddress); 
        let result = await contract.send(receivers,amounts).send({
            feeLimit:100_000_000,
            callValue:summaryCoins,
            shouldPollResponse:true
        });
        return result

        /*for (let i of body) {
            console.log('value: ', this.privateKey)
            const tradeobj = await this.tronWeb.transactionBuilder.sendTrx(i.to, i.value);
            const signedtxn = await this.tronWeb.trx.sign(tradeobj, this.privateKey);
            const receipt = await this.tronWeb.trx.sendRawTransaction(signedtxn);
            return receipt
        }*/
    }

    create() {
        return this.tronWeb.createAccount()
    }

}
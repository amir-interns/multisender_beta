import { Injectable } from "@nestjs/common";
const Web3 = require('web3');
const web3 = new Web3('wss://mainnet.infura.io/ws/v3/3f22f5d2f7294954b59850c7c8e08875');



@Injectable()
export class EtheriumService {

    sayHello(): string {
        return 'Eth'
    }

    getBalance(address: string): Promise<Object> {
        return web3.eth.getBalance(address)
    }

    sendTx(body: object): object {
        return {f: "aa"}
    }

    async checkTx(txHash: string): Promise<object> {
        return {"ssd": 123}
    }
}
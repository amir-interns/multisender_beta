import { Injectable, UploadedFile} from '@nestjs/common';

let abi=require('../../abicontract.json')
var Web3 = require('web3')
const web3 = new Web3("https://ropsten.infura.io/v3/672b38a3e2d746f5bd5f24396cb048e9");
const addrSender = '0x7cE1A7273Dc87f08fE85c9652A1f5bCD1Ed66D3B'

@Injectable()
export class UsdtService {

  async getBalance(){
    const contr = new web3.eth.Contract(abi,'0x583cbBb8a8443B38aBcC0c956beCe47340ea1367');
    let value=await contr.methods.balanceOf(addrSender).call()
    return value
  }

  async sendTx(send:object){
    const contr = new web3.eth.Contract(abi,'0x583cbBb8a8443B38aBcC0c956beCe47340ea1367');

    let trans=contr.methods.transfer(addrSender,10)
     // for (let el=0; el < Object.keys(send).length; el++){
    //   let trans=contr.methods.transfer(addrSender,10)
    // }
    return trans
  }
}


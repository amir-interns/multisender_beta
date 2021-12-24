export interface IBlockchainService {
  sendTx(address:string, key:string, send: object): Promise<string>;
  getBalance(address: string):Promise<string> ;
  createNewAccount():Promise<Account>;
  isAddress(address:string):boolean|Promise<boolean>;
  getFee(body?:object):number|Promise<number>;
  getTokenBalance(address:string):Promise<string>;
  checkTx(hash:string):Promise<boolean>;
}

export interface Account {
  address: string;
  privateKey: string;
}

export interface Send {
  value: number;
  to: string;
}

export enum Service {
  Bitcoin = 'btc',
  Ethereum = 'eth',
  ERC20 = 'usdt',
  TRC20 = 'trc20',
  Tron = 'trx'
}
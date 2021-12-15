export interface IBlockchainService {
  sendTx(address:string, key:string, send: object): string;
  getBalance(address: string): number;
  createNewAccount():object;
  isAddress(address:string):boolean;
  getFee(body?:object):number;
  getTokenBalance(address:string):number;
  checkTx(hash:string):boolean
}

export enum Service {
  Bitcoin = 'btc',
  Ethereum = 'eth',
  ERC20 = 'usdt',
  TRC20 = 'trc20',
  Tron = 'trx'
}
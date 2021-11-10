import { BitcoinService } from './bitcoin.service';
import { EthereumService } from './ethereum.service';
import { UsdtService } from './usdt.service';
export declare class BlockchainController {
    private bitcoinService;
    private etheriumService;
    private usdtService;
    constructor(bitcoinService: BitcoinService, etheriumService: EthereumService, usdtService: UsdtService);
    getBlockchainBalance(type: any, address: any): Promise<any>;
    sendBlockchainTx(params: any): Promise<object>;
}

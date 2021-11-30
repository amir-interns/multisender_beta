
import { BlockchainController } from '../blockchain/blockchain.controller';
import { TrxService } from 'src/blockchain/trx.service'
import { EthereumService } from 'src/blockchain/ethereum.service'
import { BitcoinService } from 'src/blockchain/bitcoin.service'
import { UsdtService } from 'src/blockchain/usdt.service'
import { Trc20Service } from 'src/blockchain/trc20.service'
import { Repository } from "typeorm"
import { BlockchainEntity } from "src/entity/blockchain.entity"
import { ConfigService } from "@nestjs/config"
import { SchedulerRegistry } from "@nestjs/schedule";
import {Inject} from "@nestjs/common";
import {BlockchainTask} from "../blockchain/tasks.service";
const axios = require("axios")

describe('BlockchainController', () => {
  let blockchainController: BlockchainController
  let bitcoinService: BitcoinService
  let ethereumService: EthereumService
  let trxService: TrxService
  let trc20Service: Trc20Service
  let usdtService: UsdtService
  let blockchainRepository: Repository<BlockchainEntity>
  let schedulerRegistry: SchedulerRegistry
  let configService: ConfigService




  beforeEach(() => {
    bitcoinService = new BitcoinService(blockchainRepository, configService)
    ethereumService = new EthereumService(blockchainRepository, configService)
    trxService = new TrxService(blockchainRepository, configService)
    trc20Service = new Trc20Service(blockchainRepository, configService)
    usdtService = new UsdtService(blockchainRepository, configService)
    const btcTask = new BlockchainTask(BitcoinService)
    const ethTask = new BlockchainTask(EthereumService)
    const usdtTask = new BlockchainTask(UsdtService)
    const trxTask = new BlockchainTask(TrxService)
    const trc20Task = new BlockchainTask(Trc20Service)
    blockchainController = new BlockchainController(bitcoinService, ethereumService, usdtService, trxService, trc20Service,
      btcTask, ethTask,usdtTask, trxTask, trc20Task )
  });

  describe('getBalance', () => {
    it('should return balance of Bitcoin account', async () => {
      const address = 'mhSMVCPZECSFokQUitBKNHAJT8aVxj6NQY'
        const result = await axios.get(`https://sochain.com/api/v2/get_address_balance/BTCTEST/${address}`).then((res) => { return res.data.data.confirmed_balance })
      expect(await bitcoinService.getBalance(address)).toBe(result);
    });

    it('should return balance of Tron account', async () => {
      const address = 'TY6uZkxMXXqSH8GgsoXfb3zpidUbLU3HDm'
      expect(await trxService.getBalance(address)).toBeInstanceOf(Number);
    });

    it('should return balance of TRC-20 account', async () => {
      const address = 'TAM8mEysU28Zh6WUbDeeuU1Eyh3Y38HTLV'
      expect(await trc20Service.getBalance(address)).toBeInstanceOf(Number);
    });

    it('should return balance of Ethereum account', async () => {
      const address = '0x8e3bF7AD94a541E7C7b1edc4fd07910AB0F12a59'
      expect(await ethereumService.getBalance(address)).toBeInstanceOf(Number);
    });

    it('should return balance of ERC-20 account', async () => {
      const address = '0x173cbc39bc549eb7b48a92ed170abedeee3be8f9'
      expect(await usdtService.getBalance(address)).toBeInstanceOf(Number);
    });
  });

  describe('sendTx', () => {
    it('should return balance of Bitcoin account', async () => {
      const address = 'mhSMVCPZECSFokQUitBKNHAJT8aVxj6NQY'
        const result = await axios.get(`https://sochain.com/api/v2/get_address_balance/BTCTEST/${address}`).then((res) => { return res.data.data.confirmed_balance })
      expect(await bitcoinService.getBalance(address)).toBe(result);
    });

  });


});

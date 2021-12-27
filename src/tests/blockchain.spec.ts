import {Test} from '@nestjs/testing';
import {TypeOrmModule} from "@nestjs/typeorm";
import {AppModule} from "../app.module";
import {BlockchainController} from "../blockchain/blockchain.controller";
import {EthereumService} from "../blockchain/ethereum.service";
import {BitcoinService} from "../blockchain/bitcoin.service";
import {UsdtService} from "../blockchain/usdt.service";
import {BlockchainEntity} from "../entities/blockchain.entity";
import {ConfigModule} from "@nestjs/config";
import {BlockchainTask} from "../blockchain/tasks.service";
import {TrxService} from "../blockchain/trx.service";
import {Trc20Service} from "../blockchain/trc20.service";
jest.setTimeout(3000000)

describe('Test Blockchain API', () => {
  let blockchainController: BlockchainController;

  beforeAll(async () => {
    const moduleRef  = await Test.createTestingModule({
      imports:[AppModule,  TypeOrmModule.forFeature([BlockchainEntity]), ConfigModule],
      controllers:[BlockchainController],
      providers:[EthereumService, BitcoinService, UsdtService,BlockchainTask, Object, Trc20Service, TrxService, {
        provide:'btc', useFactory: (btcSevice:BitcoinService)=>{
          return new BlockchainTask(btcSevice)
        },
        inject: [BitcoinService, BlockchainTask]
      },
        {
          provide:'eth', useFactory: async (ethService:EthereumService)=>{
            return new BlockchainTask(ethService)
          },
          inject: [EthereumService, BlockchainTask]
        },
        {
          provide:'usdt', useFactory: (usdtService:UsdtService)=>{
            return new BlockchainTask(usdtService)
          },
          inject: [UsdtService]
        },
        {
          provide:'trx', useFactory: (trxService:TrxService)=>{
            return new BlockchainTask(trxService)
          },
          inject: [TrxService]
        },
        {
          provide:'trc20', useFactory: (trc20Service:Trc20Service)=>{
            return new BlockchainTask(trc20Service)
          },
          inject: [Trc20Service]
        },
      ]
    }).compile();

    blockchainController = moduleRef.get<BlockchainController>(BlockchainController);
  });
  describe('Wrong address', () => {
    it('should return message about wrong address', async () => {
      const result = '0x5a8D90b80e82b3b2fda4002B7Ae3eBA89fb739f is wrong address!'
      expect(await blockchainController.getBlockchainBalance('eth', '0x5a8D90b80e82b3b2fda4002B7Ae3eBA89fb739f')).toBe(result)
    })
  });
  describe('Check type of returning balance', () => {
    it('should return eth balance of address', async () => {
      expect(await blockchainController.getBlockchainBalance('eth', '0x5a8D90b80e82b3b2fda4002B7Ae3eBA89fb739fc')).toEqual(expect.any(Number))
    })
  })
})
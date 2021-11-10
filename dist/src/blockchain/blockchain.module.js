"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainModule = void 0;
const common_1 = require("@nestjs/common");
const bitcoin_service_1 = require("./bitcoin.service");
const blockchain_controller_1 = require("./blockchain.controller");
const ethereum_service_1 = require("./ethereum.service");
const typeorm_1 = require("@nestjs/typeorm");
const blockchain_entity_1 = require("../../bd/src/entity/blockchain.entity");
const usdt_service_1 = require("./usdt.service");
const Auth_1 = require("../../bd/src/entity/Auth");
const auth_module_1 = require("../auth/auth.module");
const tasksEth_service_1 = require("./tasksEth.service");
const taskUsdtService_1 = require("./taskUsdtService");
const config_1 = require("@nestjs/config");
const bitcoin_1 = require("../../config/bitcoin");
const etherConfig_1 = require("../../config/etherConfig");
const tokenConfig_1 = require("../../config/tokenConfig");
let BlockchainModule = class BlockchainModule {
};
BlockchainModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([blockchain_entity_1.BlockchainEntity, Auth_1.Auth]), auth_module_1.AuthModule, config_1.ConfigModule.forFeature(bitcoin_1.default), config_1.ConfigModule.forFeature(tokenConfig_1.default), config_1.ConfigModule.forFeature(etherConfig_1.default)],
        providers: [bitcoin_service_1.BitcoinService, ethereum_service_1.EthereumService, usdt_service_1.UsdtService, tasksEth_service_1.TasksEthService, taskUsdtService_1.TasksUsdtService],
        controllers: [blockchain_controller_1.BlockchainController],
    })
], BlockchainModule);
exports.BlockchainModule = BlockchainModule;
//# sourceMappingURL=blockchain.module.js.map
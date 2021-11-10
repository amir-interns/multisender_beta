"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainController = void 0;
const common_1 = require("@nestjs/common");
const bitcoin_service_1 = require("./bitcoin.service");
const ethereum_service_1 = require("./ethereum.service");
const usdt_service_1 = require("./usdt.service");
const swagger_1 = require("@nestjs/swagger");
const blockchain_entity_1 = require("../../bd/src/entity/blockchain.entity");
const SendTx_dto_1 = require("./dto/SendTx-dto");
let BlockchainController = class BlockchainController {
    constructor(bitcoinService, etheriumService, usdtService) {
        this.bitcoinService = bitcoinService;
        this.etheriumService = etheriumService;
        this.usdtService = usdtService;
    }
    async getBlockchainBalance(type, address) {
        const service = type === 'eth' ? this.etheriumService : (type === 'btc' ? this.bitcoinService : this.usdtService);
        return await service.getBalance(address);
    }
    async sendBlockchainTx(params) {
        const service = params.type === 'eth' ? this.etheriumService : (params.type === 'btc' ? this.bitcoinService : this.usdtService);
        return service.sendTx(params.send);
    }
};
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Возвращает баланс кошелька address в сети типа type' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'В пути запроса явно указать тип и адрес' }),
    (0, common_1.Post)('balance/:type/:address'),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Param)('address')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "getBlockchainBalance", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Отправляет транзакцию в соответствии с указанными адресами и значениями сумм в выбранной сети' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Необходимо передать методом POST в теле запроса строку вида: { type: btc || eth || usdt, send: [{to: trhrth, value: 0.001}, ... ] }', type: SendTx_dto_1.SendTxDto }),
    (0, common_1.Post)('sendTx'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "sendBlockchainTx", null);
BlockchainController = __decorate([
    (0, swagger_1.ApiTags)('Blochchain методы'),
    (0, common_1.Controller)('blockchain'),
    __metadata("design:paramtypes", [bitcoin_service_1.BitcoinService,
        ethereum_service_1.EthereumService,
        usdt_service_1.UsdtService])
], BlockchainController);
exports.BlockchainController = BlockchainController;
//# sourceMappingURL=blockchain.controller.js.map
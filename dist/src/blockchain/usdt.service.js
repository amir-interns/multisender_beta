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
exports.UsdtService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const blockchain_entity_1 = require("../../bd/src/entity/blockchain.entity");
const taskUsdtService_1 = require("./taskUsdtService");
const typeorm_2 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const Contract = require('web3-eth-contract');
const abi = require("../../config/abicontract.json");
const Web3 = require('web3');
let UsdtService = class UsdtService {
    constructor(blockchainRepository, taskService, tokenConfig) {
        this.blockchainRepository = blockchainRepository;
        this.taskService = taskService;
        this.tokenConfig = tokenConfig;
        this.webSocketInfura = tokenConfig.get('TokenConfig.tokenWebSocketInfura');
        this.gasLimit = tokenConfig.get('TokenConfig.tokenGasLimit');
        this.privateKey = tokenConfig.get('TokenConfig.tokenPrivateKey');
        this.addrSender = tokenConfig.get('TokenConfig.tokenAddrSender');
        this.addrContract = tokenConfig.get('TokenConfig.tokenAddrContract');
    }
    async getBalance() {
        Contract.setProvider(this.webSocketInfura);
        let contract = new Contract(abi, this.addrContract);
        let value = await contract.methods.balanceOf(this.addrSender).call();
        return value;
    }
    async sendTx(send) {
        const web3 = new Web3(this.webSocketInfura);
        let contract = new Contract(abi, this.addrContract);
        for (let i = 0; i < Object.keys(send).length; i++) {
            let Record = await this.updateBd('Null', 'new', send[i]);
            const tx = {
                from: this.addrSender,
                to: this.addrContract,
                gasLimit: this.gasLimit,
                data: await contract.methods.transfer(send[i].to, send[i].value).encodeABI()
            };
            let signedTx = await web3.eth.accounts.signTransaction(tx, this.privateKey);
            let result = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
            let today = new Date();
            await (0, typeorm_1.getConnection)()
                .createQueryBuilder()
                .update(blockchain_entity_1.BlockchainEntity)
                .set({ status: 'submitted', txHash: result.transactionHash, result: send[i], date: String(today) })
                .where({ id: Record.id })
                .execute();
            this.taskService.addCronJob(result.transactionHash, Record.id);
        }
    }
    updateBd(txHash, status, result) {
        const today = new Date();
        let blockchainEntity = new blockchain_entity_1.BlockchainEntity();
        blockchainEntity.date = today;
        blockchainEntity.status = status;
        blockchainEntity.typeCoin = 'usdt';
        blockchainEntity.result = result;
        blockchainEntity.txHash = txHash;
        return this.blockchainRepository.save(blockchainEntity);
    }
};
UsdtService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(blockchain_entity_1.BlockchainEntity)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        taskUsdtService_1.TasksUsdtService,
        config_1.ConfigService])
], UsdtService);
exports.UsdtService = UsdtService;
//# sourceMappingURL=usdt.service.js.map
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
exports.EthereumService = void 0;
const common_1 = require("@nestjs/common");
const blockchain_entity_1 = require("../../bd/src/entity/blockchain.entity");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const tasksEth_service_1 = require("./tasksEth.service");
let Web3 = require('web3');
const config_1 = require("@nestjs/config");
let EthereumService = class EthereumService {
    constructor(blockchainRepository, tasksService, ethconfig) {
        this.blockchainRepository = blockchainRepository;
        this.tasksService = tasksService;
        this.ethconfig = ethconfig;
        this.https = ethconfig.get('EthereumConfig.https');
        this.gasPrice = ethconfig.get('EthereumConfig.gasPrice');
        this.gasLimit = ethconfig.get('EthereumConfig.gasLimit');
        this.addrSender = ethconfig.get('EthereumConfig.addrSender');
        this.chainId = ethconfig.get('EthereumConfig.chainId');
        this.privateKey = ethconfig.get('EthereumConfig.privateKey');
    }
    async sendTx(send) {
        for (let i = 0; i < Object.keys(send).length; i++) {
            const web3 = new Web3(this.https);
            let validAdd = web3.utils.isAddress(send[i].to);
            if (validAdd != true) {
                console.log(`${send[i].to} is wrong address!`);
            }
            else {
                let idRecord = await this.updateBd('Null', 'new', send[i]);
                await this.sendTrans(send[i], idRecord.id);
            }
        }
    }
    async sendTrans(send, id) {
        const web3 = new Web3(this.https);
        let valueCoins = parseInt(send.value);
        const rawTx = {
            gasPrice: this.gasPrice,
            gasLimit: this.gasLimit,
            to: send.to,
            from: this.addrSender,
            value: valueCoins,
            chainId: this.chainId
        };
        let signedTx = await web3.eth.accounts.signTransaction(rawTx, this.privateKey);
        let result = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        let today = new Date();
        await (0, typeorm_1.getConnection)()
            .createQueryBuilder()
            .update(blockchain_entity_1.BlockchainEntity)
            .set({ status: 'submitted', txHash: result.transactionHash, result: send, date: String(today) })
            .where({ id })
            .execute();
        this.tasksService.addCronJob(result.transactionHash, id);
    }
    async getBalance(address) {
        const web3 = new Web3(this.https);
        var bal = await web3.eth.getBalance(address);
        return bal;
    }
    updateBd(txHash, status, result) {
        const today = new Date();
        let blockchainEntity = new blockchain_entity_1.BlockchainEntity();
        blockchainEntity.date = today;
        blockchainEntity.status = status;
        blockchainEntity.typeCoin = 'eth';
        blockchainEntity.result = result;
        blockchainEntity.txHash = txHash;
        return this.blockchainRepository.save(blockchainEntity);
    }
};
EthereumService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(blockchain_entity_1.BlockchainEntity)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        tasksEth_service_1.TasksEthService,
        config_1.ConfigService])
], EthereumService);
exports.EthereumService = EthereumService;
//# sourceMappingURL=ethereum.service.js.map
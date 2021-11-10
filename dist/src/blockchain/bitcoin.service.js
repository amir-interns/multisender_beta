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
exports.BitcoinService = void 0;
const common_1 = require("@nestjs/common");
const blockchain_entity_1 = require("../../bd/src/entity/blockchain.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const schedule_1 = require("@nestjs/schedule");
const cron_1 = require("cron");
const typeorm_3 = require("typeorm");
const bitcoin_1 = require("../../config/bitcoin");
const config_1 = require("@nestjs/config");
const axios = require("axios");
const bitcore = require("bitcore-lib");
let BitcoinService = class BitcoinService {
    constructor(blockchainRepository, schedulerRegistry, configService) {
        this.blockchainRepository = blockchainRepository;
        this.schedulerRegistry = schedulerRegistry;
        this.configService = configService;
        this.sochain_network = configService.get('BitcoinConfig.sochain_network');
        this.privateKey = configService.get('BitcoinConfig.privateKey');
        this.sourceAddress = configService.get('BitcoinConfig.sourceAddress');
    }
    checkTx(txHash) {
        return axios.get(`https://sochain.com/api/v2/tx/${this.sochain_network}/${txHash}`).then(function (res) { return res.data; });
    }
    getBalance(address) {
        return axios.get(`https://sochain.com/api/v2/get_address_balance/${this.sochain_network}/${address}`).then(function (res) { return res.data.data.confirmed_balance; });
    }
    async sendTx(body) {
        let transactionAbout = {
            txHash: "",
            status: "new",
            result: {},
            typeCoin: "btc",
            date: new Date()
        };
        let amountToSend = 0;
        let mass = [];
        for (let i of body) {
            amountToSend = amountToSend + parseFloat(i.value);
        }
        ;
        const satoshiToSend = amountToSend * 100000000;
        let fee = 0;
        let inputCount = 0;
        let outputCount = 1;
        for (let i of body) {
            outputCount++;
        }
        ;
        if (outputCount > 50) {
            throw new Error("Too much transactions. Max 50.");
        }
        const utxos = await axios.get(`https://sochain.com/api/v2/get_tx_unspent/${this.sochain_network}/${this.sourceAddress}`);
        const transaction = new bitcore.Transaction();
        let totalAmountAvailable = 0;
        let inputs = [];
        utxos.data.data.txs.forEach(async (element) => {
            let utxo = {};
            utxo.satoshis = Math.floor(Number(element.value) * 100000000);
            utxo.script = element.script_hex;
            utxo.address = utxos.data.data.address;
            utxo.txId = element.txid;
            utxo.outputIndex = element.output_no;
            totalAmountAvailable += utxo.satoshis;
            inputCount += 1;
            inputs.push(utxo);
        });
        const transactionSize = inputCount * 146 + outputCount * 34 + 10 - inputCount;
        fee = transactionSize;
        if (totalAmountAvailable - satoshiToSend - fee < 0) {
            throw new Error("Balance is too low for this transaction");
        }
        transaction.from(inputs);
        for (let i of body) {
            if (totalAmountAvailable - transaction.outputAmount - fee - (parseFloat(i.value) * 100000000) < 0) {
                break;
            }
            transaction.to(i.to, parseFloat(i.value) * 100000000);
            mass.push({
                to: i.to,
                value: i.value,
                transactionHash: ""
            });
        }
        transaction.change(this.sourceAddress);
        transaction.fee(fee * 10);
        transaction.sign(this.privateKey);
        const serializedTX = transaction.serialize();
        const result = await axios({
            method: "POST",
            url: `https://sochain.com/api/v2/send_tx/${this.sochain_network}`,
            data: {
                tx_hex: serializedTX,
            },
        });
        mass.forEach(element => {
            element.transactionHash = result.data.data.txid;
        });
        const responseData = {
            status: result.data.status,
            transfers: mass
        };
        transactionAbout.date = new Date();
        transactionAbout.result = responseData;
        transactionAbout.txHash = result.data.data.txid;
        const dbId = await this.create(transactionAbout);
        this.addCronJob(String(dbId), "5", transactionAbout.txHash);
        return responseData;
    }
    ;
    findOne(id) {
        return this.blockchainRepository.findOne(id);
    }
    async create(blockchainDto) {
        const blockchainEntity = new blockchain_entity_1.BlockchainEntity();
        blockchainEntity.txHash = blockchainDto.txHash;
        blockchainEntity.status = blockchainDto.status;
        blockchainEntity.result = blockchainDto.result;
        blockchainEntity.typeCoin = blockchainDto.typeCoin;
        blockchainEntity.date = blockchainDto.date;
        const note = await this.blockchainRepository.save(blockchainEntity);
        return note.id;
    }
    async findAll() {
        return this.blockchainRepository.find();
    }
    addCronJob(id, seconds, thH) {
        const job = new cron_1.CronJob(`${seconds} * * * * *`, async () => {
            let confirms = await axios.get(`https://sochain.com/api/v2/tx/${this.sochain_network}/${thH}`).then(function (res) { return res.data.data.confirmations; });
            if (Number(confirms) >= 1) {
                await (0, typeorm_3.getConnection)()
                    .createQueryBuilder()
                    .update(blockchain_entity_1.BlockchainEntity)
                    .set({ status: "submitted" })
                    .where(id)
                    .execute();
            }
            if (Number(confirms) >= 3) {
                await (0, typeorm_3.getConnection)()
                    .createQueryBuilder()
                    .update(blockchain_entity_1.BlockchainEntity)
                    .set({ status: "confirmed" })
                    .where(id)
                    .execute();
                this.deleteCron(id);
            }
        });
        this.schedulerRegistry.addCronJob(id, job);
        job.start();
    }
    deleteCron(name) {
        this.schedulerRegistry.deleteCronJob(name);
    }
};
BitcoinService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(blockchain_entity_1.BlockchainEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        schedule_1.SchedulerRegistry,
        config_1.ConfigService])
], BitcoinService);
exports.BitcoinService = BitcoinService;
//# sourceMappingURL=bitcoin.service.js.map
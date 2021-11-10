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
exports.TasksUsdtService = void 0;
const common_1 = require("@nestjs/common");
const cron_1 = require("cron");
const schedule_1 = require("@nestjs/schedule");
const blockchain_entity_1 = require("../../bd/src/entity/blockchain.entity");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const typeorm_3 = require("typeorm");
const config_1 = require("@nestjs/config");
const Web3 = require('web3');
let TasksUsdtService = class TasksUsdtService {
    constructor(blockchainRepository, schedulerRegistry, tokenConfig) {
        this.blockchainRepository = blockchainRepository;
        this.schedulerRegistry = schedulerRegistry;
        this.tokenConfig = tokenConfig;
        this.ws = tokenConfig.get('TokenConfig.tokenWebSocketInfura');
    }
    addCronJob(hash, id) {
        const web3 = new Web3(this.ws);
        const job = new cron_1.CronJob(`10 * * * * *`, () => {
            let receipt = web3.eth.getTransactionReceipt(hash).then(async (value) => {
                let blockN = parseInt(value.blockNumber);
                if (blockN >= 3) {
                    let today = new Date();
                    await (0, typeorm_3.getConnection)()
                        .createQueryBuilder()
                        .update(blockchain_entity_1.BlockchainEntity)
                        .set({ status: 'confirmed', date: String(today) })
                        .where({ id })
                        .execute();
                    this.deleteCron(hash);
                }
            });
        });
        this.schedulerRegistry.addCronJob(hash, id);
        job.start();
    }
    deleteCron(name) {
        this.schedulerRegistry.deleteCronJob(name);
    }
};
TasksUsdtService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(blockchain_entity_1.BlockchainEntity)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        schedule_1.SchedulerRegistry,
        config_1.ConfigService])
], TasksUsdtService);
exports.TasksUsdtService = TasksUsdtService;
//# sourceMappingURL=taskUsdtService.js.map
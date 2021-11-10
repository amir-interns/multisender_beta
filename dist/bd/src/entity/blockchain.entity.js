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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainEntity = void 0;
const swagger_1 = require("@nestjs/swagger");
const typeorm_1 = require("typeorm");
let BlockchainEntity = class BlockchainEntity {
};
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1', description: 'Уникальный идентификатор' }),
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], BlockchainEntity.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ksdgjh14h21uh3412i3dli21hdilhi123', description: 'Хэш транзакции' }),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], BlockchainEntity.prototype, "txHash", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'confirmed', description: 'Статус выполнения транзакции' }),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], BlockchainEntity.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'success', description: 'Результат выполнения транзакции' }),
    (0, typeorm_1.Column)({ type: 'jsonb',
        default: () => "'[]'" }),
    __metadata("design:type", Object)
], BlockchainEntity.prototype, "result", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'eth', description: 'Сеть в которой была сделана транзакция' }),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], BlockchainEntity.prototype, "typeCoin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '10.00', description: 'Время в которое была сделана транзакция' }),
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], BlockchainEntity.prototype, "date", void 0);
BlockchainEntity = __decorate([
    (0, typeorm_1.Entity)()
], BlockchainEntity);
exports.BlockchainEntity = BlockchainEntity;
//# sourceMappingURL=blockchain.entity.js.map
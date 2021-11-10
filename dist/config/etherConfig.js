"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('EthereumConfig', () => ({
    https: process.env.https || "https://ropsten.infura.io/v3/672b38a3e2d746f5bd5f24396cb048e9",
    gasPrice: parseInt(process.env.gasPrice) || 1600000015,
    gasLimit: parseInt(process.env.gasLimit) || 1000000,
    chainId: parseInt(process.env.chainId) || 3,
    privateKey: String(process.env.EthprivateKey),
    addrSender: String(process.env.addrSender),
}));
//# sourceMappingURL=etherConfig.js.map
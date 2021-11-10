"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('BitcoinConfig', () => ({
    sochain_network: process.env.sochain_network,
    privateKey: process.env.privateKey,
    sourceAddress: process.env.sourceAddress,
}));
//# sourceMappingURL=bitcoin.js.map
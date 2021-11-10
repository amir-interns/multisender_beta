"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('database', () => ({
    type: "postgres",
    port: Number(process.env.PORT),
    host: process.env.HOST,
    username: process.env.username,
    password: process.env.password,
    database: process.env.database,
    synchronize: true
}));
//# sourceMappingURL=database.js.map
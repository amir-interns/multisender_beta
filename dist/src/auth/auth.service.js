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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const typeorm_1 = require("typeorm");
const Auth_1 = require("../../bd/src/entity/Auth");
let AuthService = class AuthService {
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    async login(user) {
        let result = await (0, typeorm_1.getConnection)()
            .getRepository(Auth_1.Auth)
            .createQueryBuilder('auth')
            .where('username=:user', { user: user.username })
            .getOne();
        const passwMatch = await bcrypt.compare(user.password, result.password);
        if (passwMatch) {
            const payload = { username: user.username, sub: user.userId };
            return {
                access_token: this.jwtService.sign(payload),
            };
        }
        else {
            return 'Wrong password or username';
        }
    }
    async register(user) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        let result = await (0, typeorm_1.getConnection)()
            .getRepository(Auth_1.Auth)
            .createQueryBuilder('auth')
            .where('username=:user', { user: user.username })
            .getOne();
        if (result) {
            return 'Change username!';
        }
        try {
            const createdUser = await this.usersService.create(user.username, hashedPassword);
            return createdUser;
        }
        catch (error) {
            return error;
        }
    }
};
AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map
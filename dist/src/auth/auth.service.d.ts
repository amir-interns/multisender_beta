import { UsersService } from '../users/users.service';
import { JwtService } from "@nestjs/jwt";
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    login(user: any): Promise<"Wrong password or username" | {
        access_token: string;
    }>;
    register(user: any): Promise<any>;
}

import { Repository } from "typeorm";
import { Auth } from "../../bd/src/entity/Auth";
export declare type User = any;
export declare class UsersService {
    private auth;
    constructor(auth: Repository<Auth>);
    findOne(username: string): Promise<User | undefined>;
    create(username: string, password: string): Promise<any>;
}

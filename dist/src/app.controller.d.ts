import { AppService } from './app.service';
import { AuthService } from "./auth/auth.service";
export declare class AppController {
    private readonly appService;
    private authService;
    constructor(appService: AppService, authService: AuthService);
    login(req: any): Promise<"Wrong password or username" | {
        access_token: string;
    }>;
    regist(req: any): Promise<any>;
}

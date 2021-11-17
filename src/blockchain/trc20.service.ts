import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class Trc20Service {
    getBalance(address) {
        return address
    }

    sendTx(body) {
        return body
    }
}
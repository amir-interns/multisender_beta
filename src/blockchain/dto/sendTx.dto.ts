import { ApiProperty } from "@nestjs/swagger"

export class SendTxDto{
    @ApiProperty({example: 'eth', description: 'Сеть: btc, eth, usdt'})
    readonly type:string

    @ApiProperty({example: '[{"to": "mriQ2uqs8erWnwei43fSDh4RqpvMFC3jdW", "value": 0.0001}]', description: 'Массив адресов'})
    readonly send:object
}
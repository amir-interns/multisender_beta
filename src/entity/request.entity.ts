import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class RequestEntity {
    @ApiProperty({example: '1', description: 'Уникальный идентификатор'})
    @PrimaryGeneratedColumn('increment')
    id: number;

    @ApiProperty({example: '1', description: 'Идентификатор таблицы BlockchainEntity'})
    @Column()
    idBlEnt: number;

    @ApiProperty({example: '0x24822D24028fD8CCb969B88fB4BD92DC53CA1B20', description: 'Адреса для получения монет'})
    @Column()
    address: string;

    @ApiProperty({example: '0x24822D24028fD8CCb969B88fB4BD92DC53CA1B20', description: 'Ключ'})
    @Column()
    prKey: string;

    @ApiProperty({example: '10000000000', description: 'Сумма монет с учетом комисии'})
    @Column({type:"bigint"})
    finalSum: string;

    @ApiProperty({example: 'payed', description: 'Статус заявки'})
    @Column()
    status: string;

    @ApiProperty({example: '10.00', description: 'Дата/Время, в которое была сохдана транзакция'})
    @Column()
    date: Date;

}
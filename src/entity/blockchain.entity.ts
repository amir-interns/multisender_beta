import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class BlockchainEntity {
  @ApiProperty({example: '1', description: 'Уникальный идентификатор'})
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ApiProperty({example: 'ksdgjh14h21uh3412i3dli21hdilhi123', description: 'Хэш транзакции'})
  @Column({nullable: true})
  txHash: string;

  @ApiProperty({example: 'confirmed', description: 'Статус выполнения транзакции'})
  @Column()
  status: string;

  @ApiProperty({example: 'success', description: 'Результат выполнения транзакции'})
  @Column({type: 'jsonb',
           default: () => "'[]'"})
  result: object;

  @ApiProperty({example: 'eth', description: 'Сеть в которой была сделана транзакция'})
  @Column()
  typeCoin: string;

  @ApiProperty({example: '10.00', description: 'Время в которое была сделана транзакция'})
  @Column()
  date: Date;

}
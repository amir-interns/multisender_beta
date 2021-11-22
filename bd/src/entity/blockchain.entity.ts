import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class BlockchainEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({nullable: true})
  txHash: string;

  @Column()
  status: string;

  @Column({type: 'jsonb',
           default: () => "'[]'"})
  result: object;

  @Column()
  typeCoin: string;

  @Column()
  date: Date;

}
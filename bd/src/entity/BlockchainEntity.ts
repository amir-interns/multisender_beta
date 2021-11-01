import { Entity, Column, PrimaryGeneratedColumn , ColumnOptions} from 'typeorm';

@Entity()
export class BlockchainEntity {

    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable:true})
    txHash: string

    @Column()
    status: string

    @Column({type:'jsonb', nullable:true})
    result: string

    @Column({type: 'text'})
    typeCoin: string

    @Column('timestamp without time zone')
    date: string

}
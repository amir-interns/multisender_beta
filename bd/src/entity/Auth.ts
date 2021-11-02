import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class Auth {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;
}

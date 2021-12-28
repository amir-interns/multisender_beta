import { ApiProperty } from "@nestjs/swagger";
import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class AuthEntity {
  @ApiProperty({example: '1', description: 'Уникальный идентификатор'})
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({example: 'Admin', description: 'Имя пользователя'})
  @Column()
  username: string;

  @ApiProperty({example: 'PASSWORD', description: 'Пароль пользователя'})
  @Column()
  password: string;
}

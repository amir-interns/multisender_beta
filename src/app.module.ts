import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BlockchainModule } from './blockchain/blockchain.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import configuration from 'config/configuration';
import * as path from 'path'
import { BlockchainEntity } from '../bd/src/entity/blockchain.entity';
import {Auth} from "../bd/src/entity/Auth";
import {AuthModule} from "./auth/auth.module";

@Module({
  imports: [
            TypeOrmModule.forRootAsync({
              imports: [ConfigModule],
              useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get('host', 'localhost'),
                port: configService.get<number>('port', 5432),
                username: configService.get('username', 'postgres'),
                password: configService.get('password', 'postgres'),
                database: configService.get('database', 'bd'),
                entities: [BlockchainEntity, Auth],
                synchronize: configService.get('synchronize'),
              }),
              inject: [ConfigService],
            }),
            ScheduleModule.forRoot(),
            AuthModule,BlockchainModule
            ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


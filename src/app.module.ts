import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BlockchainModule } from './blockchain/blockchain.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import configuration from 'config/configuration';
import * as path from 'path'
import { BlockchainEntity } from './blockchain/blockchain.entity';

@Module({
  imports: [
          //  ConfigModule.forRoot({ load: [configuration] }),
            TypeOrmModule.forRootAsync({
              imports: [ConfigModule],
              useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get('host', 'localhost'),
                port: configService.get<number>('port', 5432),
                username: configService.get('username', 'postgres'),
                password: configService.get('password', 'postgres'),
                database: configService.get('database', 'test'),
                entities: [BlockchainEntity],
                synchronize: configService.get('synchronize'),
              }),
              inject: [ConfigService],
            }),
            ScheduleModule.forRoot(),
            BlockchainModule
            ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


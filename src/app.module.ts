import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BlockchainModule } from './blockchain/blockchain.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import  database  from 'config/database'
import BitcoinConfig from 'config/bitcoin'
import { BlockchainEntity } from './entity/blockchain.entity'; 
import { Auth } from './entity/Auth'; 
import { AuthModule } from './auth/auth.module';
import EthereumConfig from 'config/etherConfig'
import TokenConfig from 'config/etherConfig'
import { LoggerMiddleware } from './utils/logger.middleware';


@Module({
  imports: [ConfigModule.forRoot({ load: [database, BitcoinConfig, EthereumConfig, TokenConfig], envFilePath: '.development.env' }),

            TypeOrmModule.forRootAsync({
              imports: [ConfigModule],
              useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get<string>('database.host'),
                port: configService.get<number>('database.port'),
                username: configService.get<string>('database.username'),
                password: configService.get<string>('database.password'),
                database: configService.get<string>('database.database'),
                entities: [BlockchainEntity, Auth],
                synchronize: configService.get<boolean>('database.synchronize'),
              }),
              inject: [ConfigService],
            }),
            ScheduleModule.forRoot(),
            AuthModule,BlockchainModule
            ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*')
  }
}


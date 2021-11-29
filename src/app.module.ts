import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AppController } from 'src/app.controller';
import { AppService } from 'src/app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BlockchainModule } from 'src/blockchain/blockchain.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import  database  from 'config/database.config'
import BitcoinConfig from 'config/bitcoin.config'
import { BlockchainEntity } from 'src/entity/blockchain.entity';
import { AuthEntity } from 'src/entity/auth.entity';
import { AuthModule } from 'src/auth/auth.module';
import EthereumConfig from 'config/ether.config'
import TokenConfig from 'config/ether.config'
import { LoggerMiddleware } from 'src/utils/logger.middleware';


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
                entities: [BlockchainEntity, AuthEntity],
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


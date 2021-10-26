import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { BlockchainModule } from './blockchain/blockchain.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockchainEntity } from './blockchain/blockchain.entity';
import { ScheduleModule } from '@nestjs/schedule';


@Module({
  imports: [
            ConfigModule.forRoot({envFilePath: './.development.env'}),
            TypeOrmModule.forRoot({
              type: "postgres",
              host: process.env.host,
              port: Number(process.env.dbport),
              username: process.env.dbusername,
              password: process.env.dbpassword,
              database: process.env.database,
              entities: [BlockchainEntity],
              synchronize: true
            }),
            ScheduleModule.forRoot(),
            BlockchainModule
            ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

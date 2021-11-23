import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Multisender-beta')
    .setDescription('Amir-interns test project')
    .setVersion('0.0.1')
    .addTag('Backend-методы')
    .build()

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/docs', app, document)


  await app.listen(process.env.APP_PORT || 3000);
}
bootstrap();

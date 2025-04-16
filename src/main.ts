import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);

  const config = new DocumentBuilder()
    .setTitle('Klehra Tool Server API')
    .setDescription('API documentation for the Klehra tool server')
    .setVersion('1.0')
    .addTag('tools') // Optional:  Categorize your API
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // Accessible at /api

  await app.listen(port);
  console.log(`Application is running on port: ${port}`);
}
bootstrap();

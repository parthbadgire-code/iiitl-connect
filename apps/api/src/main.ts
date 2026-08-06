import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);

//   app.enableCors({
//     origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
//     credentials: true,
//   });

//   await app.listen(process.env.PORT ?? 3001);
// }
// bootstrap();
// apps/api/src/main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://172.70.99.196:3000',
      process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
  });

  // (Keep the rest of your app.listen code...)
  await app.listen(process.env.PORT || 3001, '0.0.0.0');

}
bootstrap();

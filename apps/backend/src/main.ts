import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  app.use(session({
    secret: process.env.SESSION_KEY || 'secure-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 86400000 }
  }));

  const port = process.env.PORT || 3000;
  await app.listen(port);
}

bootstrap();

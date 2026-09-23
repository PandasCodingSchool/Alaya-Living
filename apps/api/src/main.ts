import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cookieParser = require('cookie-parser');
import { AppModule } from './app.module';
import { webOrigins } from './lib/constants';

class CorsIoAdapter extends IoAdapter {
  constructor(
    app: INestApplication,
    private readonly origin: ReturnType<typeof webOrigins>,
  ) {
    super(app);
  }

  createIOServer(port: number, options?: Partial<ServerOptions>) {
    return super.createIOServer(port, {
      ...options,
      cors: { origin: this.origin, credentials: true },
      transports: ['websocket', 'polling'],
    });
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useWebSocketAdapter(new CorsIoAdapter(app, webOrigins()));
  app.enableCors({
    origin: webOrigins(),
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  const port = Number(process.env.PORT || 4000);
  await app.listen(port, '0.0.0.0');
  console.log(`API listening on ${port}`);
}

bootstrap();

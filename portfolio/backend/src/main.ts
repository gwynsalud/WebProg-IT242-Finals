import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // Create the NestJS application instance
  const app = await NestFactory.create(AppModule);

  // 1. Set the Global Prefix: This ensures all routes (like /guild) 
  // are automatically prefixed with /api to match your vercel.json rewrites.
  app.setGlobalPrefix('api');

  // 2. Enable CORS: This allows your frontend (hosted on the same or different domain)
  // to make fetch requests to this backend without being blocked by the browser.
  app.enableCors();

  // 3. Port Configuration: Vercel injects a PORT environment variable. 
  // We use 3000 as a fallback for your local Codespaces testing.
  await app.listen(process.env.PORT || 3000);
}

// Initialize the bootstrap function
bootstrap();
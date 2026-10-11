import { VersioningType, type INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ResponseEnvelopeInterceptor } from './common/interceptors/response-envelope.interceptor';
import { requestIdMiddleware } from './common/middleware/request-id.middleware';

export interface AppSetupOptions {
  corsOrigins?: string[];
  swaggerEnabled?: boolean;
}

/** Shared by main.ts and e2e tests so tests exercise the real HTTP pipeline. */
export function configureApp(app: INestApplication, options: AppSetupOptions = {}): void {
  app.use(requestIdMiddleware);
  app.use(helmet());
  app.enableCors({ origin: options.corsOrigins ?? [], credentials: true });

  app.setGlobalPrefix('api', { exclude: ['health', 'health/live', 'health/ready'] });
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ResponseEnvelopeInterceptor());

  if (options.swaggerEnabled) {
    const doc = SwaggerModule.createDocument(
      app,
      new DocumentBuilder().setTitle('DevPilot AI API').setVersion('0.1.0').build(),
    );
    SwaggerModule.setup('api/docs', app, doc);
  }
}

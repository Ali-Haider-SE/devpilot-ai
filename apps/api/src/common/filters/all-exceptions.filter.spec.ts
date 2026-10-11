import { ArgumentsHost, ForbiddenException, Logger } from '@nestjs/common';
import { AppException } from '../errors/app.exception';
import { AllExceptionsFilter } from './all-exceptions.filter';

function run(exception: unknown) {
  const json = jest.fn();
  const res = { status: jest.fn().mockReturnThis(), json };
  const host = {
    switchToHttp: () => ({ getRequest: () => ({ id: 'req-12345678' }), getResponse: () => res }),
  } as unknown as ArgumentsHost;
  new AllExceptionsFilter().catch(exception, host);
  return { status: res.status.mock.calls[0][0] as number, body: json.mock.calls[0][0] };
}

describe('AllExceptionsFilter', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => jest.restoreAllMocks());

  it('formats AppException with code, details and requestId', () => {
    const { status, body } = run(new AppException(503, 'NOT_READY', 'Not ready', { checks: [] }));
    expect(status).toBe(503);
    expect(body).toMatchObject({
      success: false,
      error: { code: 'NOT_READY', message: 'Not ready', requestId: 'req-12345678', details: { checks: [] } },
    });
    expect(typeof body.error.timestamp).toBe('string');
  });

  it('maps HttpException status to a stable code', () => {
    const { status, body } = run(new ForbiddenException('nope'));
    expect(status).toBe(403);
    expect(body.error.code).toBe('FORBIDDEN');
  });

  it('hides internals of unknown errors', () => {
    const { status, body } = run(new Error('connection string postgres://u:secret@db'));
    expect(status).toBe(500);
    expect(body.error.code).toBe('INTERNAL_ERROR');
    expect(JSON.stringify(body)).not.toContain('secret');
  });
});

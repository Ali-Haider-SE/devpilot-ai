import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

const SAFE_ID = /^[A-Za-z0-9._-]{8,128}$/;

function pick(header: string | string[] | undefined): string | undefined {
  const value = Array.isArray(header) ? header[0] : header;
  return value && SAFE_ID.test(value) ? value : undefined;
}

export type RequestWithIds = Request & { id?: string; correlationId?: string };

/** Assigns request/correlation IDs (accepting well-formed inbound ones) and echoes them. */
export function requestIdMiddleware(req: RequestWithIds, res: Response, next: NextFunction): void {
  const requestId = pick(req.headers['x-request-id']) ?? randomUUID();
  const correlationId = pick(req.headers['x-correlation-id']) ?? requestId;
  req.id = requestId;
  req.correlationId = correlationId;
  res.setHeader('x-request-id', requestId);
  res.setHeader('x-correlation-id', correlationId);
  next();
}

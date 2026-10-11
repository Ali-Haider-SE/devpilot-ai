/** Stable, machine-readable error codes shared by backend and (later) frontend. */
export const ErrorCode = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NOT_IMPLEMENTED: 'NOT_IMPLEMENTED',
  UNAVAILABLE: 'UNAVAILABLE',
  NOT_READY: 'NOT_READY',
} as const;
export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export interface ApiMeta {
  requestId: string;
  timestamp: string;
  nextCursor?: string | null;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta: ApiMeta;
}

export interface ApiErrorBody {
  code: ErrorCode;
  message: string;
  requestId: string;
  timestamp: string;
  details?: unknown;
}

export interface ApiError {
  success: false;
  error: ApiErrorBody;
}

export type CheckStatus = 'up' | 'down';

export interface DependencyCheck {
  name: string;
  status: CheckStatus;
  latencyMs: number;
  /** Safe, non-sensitive reason only (e.g. "timeout", "unreachable"). */
  reason?: string;
}

export interface HealthReport {
  status: 'ok' | 'degraded';
  uptimeSeconds: number;
  checks: DependencyCheck[];
}

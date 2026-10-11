import type { ConnectionOptions } from 'bullmq';

/** Converts a redis:// or rediss:// URL into BullMQ connection options. */
export function redisConnectionFromUrl(url: string): ConnectionOptions {
  const u = new URL(url);
  const db = u.pathname && u.pathname !== '/' ? Number(u.pathname.slice(1)) : undefined;
  return {
    host: u.hostname,
    port: u.port ? Number(u.port) : 6379,
    username: u.username ? decodeURIComponent(u.username) : undefined,
    password: u.password ? decodeURIComponent(u.password) : undefined,
    db: Number.isInteger(db) ? db : undefined,
    ...(u.protocol === 'rediss:' ? { tls: {} } : {}),
  };
}

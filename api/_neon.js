import { neon } from '@neondatabase/serverless';

let client;

export function getNeon() {
  if (!process.env.NEON_DATABASE_URL) throw new Error('NEON_DATABASE_URL no configurada');
  client ||= neon(process.env.NEON_DATABASE_URL);
  return client;
}

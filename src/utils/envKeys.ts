// No se inyectan secretos VITE_* en el bundle público.
// Las claves introducidas explícitamente por el usuario siguen siendo locales
// hasta migrar cada proveedor a un endpoint server-side.
export const ENV: Record<string, string> = {};

export const getStoredKey = (key: string): string =>
  localStorage.getItem(`osint_${key}`) || ENV[key] || '';

export const persistEnvKeys = () => undefined;

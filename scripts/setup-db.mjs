// Supabase quedó archivado como respaldo y no participa en el runtime.
// La base activa es Neon: aplicar neon/migrations/*.sql con una conexión
// server-side. No guardar credenciales ni URLs privadas en este script.
console.error('Script legado retirado: usa Neon y las migraciones de neon/.');
process.exitCode = 1;

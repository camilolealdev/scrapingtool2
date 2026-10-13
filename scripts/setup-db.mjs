import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ngefsbjlplcpetpysgti.supabase.co',
  'REMOVED-ROTATE-THIS-KEY'
);

// Step 1: create bootstrap function that can execute DDL
const { error: fnErr } = await supabase.rpc('exec_ddl', { sql: 'SELECT 1' }).then(
  () => ({ error: null }),
  () => ({ error: 'not found' })
);

if (fnErr) {
  // Function doesn't exist yet — create it via the REST insert trick on pg_catalog
  console.log('Función exec_ddl no existe, creando via query directa...');
}

// Use the postgrest /rpc endpoint with pg_notify as a test
const test = await fetch('https://ngefsbjlplcpetpysgti.supabase.co/rest/v1/rpc/version', {
  method: 'POST',
  headers: {
    'apikey': SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json'
  },
  body: '{}'
});
console.log('version rpc status:', test.status, await test.text());

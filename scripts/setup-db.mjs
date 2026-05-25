import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ngefsbjlplcpetpysgti.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nZWZzYmpscGxjcGV0cHlzZ3RpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTcyMTEwMywiZXhwIjoyMDk1Mjk3MTAzfQ.LZJeKUWK_34DFdZUven60ERYcNCgxTRJsuR2-8wNl3o'
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
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nZWZzYmpscGxjcGV0cHlzZ3RpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTcyMTEwMywiZXhwIjoyMDk1Mjk3MTAzfQ.LZJeKUWK_34DFdZUven60ERYcNCgxTRJsuR2-8wNl3o',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nZWZzYmpscGxjcGV0cHlzZ3RpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTcyMTEwMywiZXhwIjoyMDk1Mjk3MTAzfQ.LZJeKUWK_34DFdZUven60ERYcNCgxTRJsuR2-8wNl3o',
    'Content-Type': 'application/json'
  },
  body: '{}'
});
console.log('version rpc status:', test.status, await test.text());
